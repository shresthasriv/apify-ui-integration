const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();
const APIFY_BASE_URL = 'https://api.apify.com/v2';

const handleApiRequest = (handler) => async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Apify API token is missing.' });
  }

  try {
    await handler(req, res, token);
  } catch (error) {
    console.error('--- DEBUG: AN ERROR OCCURRED ---');
    console.error(error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || 'An internal server error occurred.';
    res.status(status).json({ error: message });
  }
};

router.get('/actors', handleApiRequest(async (req, res, token) => {
  const url = `${APIFY_BASE_URL}/acts?token=${token}`;
  const response = await axios.get(url);
  res.json(response.data.data.items);
}));

router.get('/actors/:actorId', handleApiRequest(async (req, res, token) => {
  const { actorId } = req.params;
  console.log(`\n--- DEBUG: 1. Fetching schema for actor ID: ${actorId} ---`);

  const actorDetailsUrl = `${APIFY_BASE_URL}/acts/${actorId}?token=${token}`;
  const actorResponse = await axios.get(actorDetailsUrl);
  const data = actorResponse.data.data;
  const latestVersionNumber = data.latestVersionNumber;

  console.log(`--- DEBUG: 2. Found latest version number: ${latestVersionNumber} ---`);

  let schemaToSend = {};
  let gotSchema = false;
  if (latestVersionNumber) {
    const versionDetailsUrl = `${APIFY_BASE_URL}/acts/${actorId}/versions/${latestVersionNumber}?token=${token}`;
    try {
      const versionResponse = await axios.get(versionDetailsUrl);
      console.log('--- DEBUG: 3. Got full response from Apify for the version. Raw data is: ---');
      console.log(JSON.stringify(versionResponse.data, null, 2));
      if (versionResponse.data.data.input && Object.keys(versionResponse.data.data.input).length > 0) {
        schemaToSend = versionResponse.data.data.input;
        gotSchema = true;
      }
    } catch (err) {
      console.log('--- DEBUG: 3a. Failed to fetch version details, falling back. ---');
    }
  }

  if (!gotSchema && data.input && Object.keys(data.input).length > 0) {
    console.log('--- DEBUG: 4a. Using top-level input property. ---');
    schemaToSend = data.input;
    gotSchema = true;
  }

  if (!gotSchema) {
    try {
      const username = data.username;
      const actorName = data.name;
      const url = `https://apify.com/${username}/${actorName}/input-schema`;
      const pageResponse = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        responseType: 'text'
      });
      let schema = null;
      if (typeof pageResponse.data === 'string' && pageResponse.data.trim().startsWith('<!DOCTYPE html')) {
        const $ = cheerio.load(pageResponse.data);
        let jsonText = null;
        const div = $('[data-test-id="input-schema-content"]');
        if (div.length) {
          let codeText = '';
          div.find('code, pre').each((i, el) => {
            codeText += $(el).text();
          });
          codeText = codeText.trim();
          if (codeText.startsWith('{') && codeText.endsWith('}')) {
            jsonText = codeText;
          } else {
            const match = codeText.match(/\{[\s\S]*\}/);
            if (match) jsonText = match[0];
          }
          if (!jsonText) {
            const schemaObj = { properties: {}, required: [] };
            div.children('h2').each((i, el) => {
              const fieldName = $(el).attr('id') || $(el).text().trim();
              let typeInfo = $(el).next('p');
              let type = 'string';
              let optional = true;
              if (typeInfo.length) {
                const typeSpan = typeInfo.find('.InputSchemaProperty-type').text().trim();
                if (typeSpan) type = typeSpan;
                const optSpan = typeInfo.find('span').filter((i, s) => $(s).text().toLowerCase().includes('optional')).text();
                if (!optSpan) optional = false;
              }
              let descDiv = typeInfo.next('div');
              let description = '';
              if (descDiv.length) {
                description = descDiv.text().trim();
              }
              schemaObj.properties[fieldName] = { type, description };
              if (!optional) schemaObj.required.push(fieldName);
            });
            if (Object.keys(schemaObj.properties).length > 0) {
              jsonText = JSON.stringify(schemaObj, null, 2);
            }
          }
        }
        if (!jsonText) {
          $('pre, code').each((i, el) => {
            const text = $(el).text().trim();
            if (text.startsWith('{') && text.endsWith('}')) {
              jsonText = text;
              return false;
            }
          });
        }
        if (!jsonText) {
          const match = pageResponse.data.match(/\{[\s\S]*\}/);
          if (match) jsonText = match[0];
        }
        if (jsonText) {
          try {
            schema = JSON.parse(jsonText);
          } catch (e) {
            schema = null;
          }
        }
      } else {
        schema = pageResponse.data;
      }
      if (schema) {
        schemaToSend = schema;
        gotSchema = true;
        console.log('--- DEBUG: 5. Scraped schema from Apify Store page (robust). ---');
      }
    } catch (e) {
      console.log('--- DEBUG: 6. Failed to scrape Apify Store page for schema (robust). ---');
    }
  }

  if (!gotSchema && data.exampleRunInput && data.exampleRunInput.body) {
    try {
      const exampleInput = JSON.parse(data.exampleRunInput.body);
      schemaToSend = exampleInput;
      gotSchema = true;
      console.log('--- DEBUG: 7. Using exampleRunInput.body as schema. ---');
    } catch (e) {
      console.log('--- DEBUG: 8. Failed to parse exampleRunInput.body. ---');
    }
  }

  if (!gotSchema) {
    console.log('--- DEBUG: 9. No schema found, sending empty object. ---');
    schemaToSend = {};
  }

  console.log('--- DEBUG: 10. Extracted schema to send to frontend. It is: ---');
  console.log(JSON.stringify(schemaToSend, null, 2));
  res.json(schemaToSend);
}));

router.post('/actors/:actorId/run', handleApiRequest(async (req, res, token) => {
  const { actorId } = req.params;
  const url = `${APIFY_BASE_URL}/acts/${actorId}/run-sync-get-dataset-items?token=${token}`;
  const runInput = req.body;
  const response = await axios.post(url, runInput, { headers: { 'Content-Type': 'application/json' } });
  res.json(response.data);
}));

module.exports = router;