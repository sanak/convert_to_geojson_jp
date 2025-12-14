import { rm, readFile } from 'fs/promises';
import * as path from 'path';

import { prepareFixtureShapefile } from '../setup';
import { JpShapeConverter, utils } from '../../lib';

let fixturePath: string;

async function loadJson(jsonPath: string) {
  const file = await readFile(jsonPath, 'utf-8');
  const geojson = JSON.parse(file);
  return geojson;
}

beforeAll(async () => {
  fixturePath = await prepareFixtureShapefile();
});

afterAll(async () => {
  await rm(path.dirname(fixturePath), { recursive: true, force: true });
});

let JG: JpShapeConverter;
let simplifyGeojson: string;
const destBaseDir = './test/tmp';
beforeEach(async () => {
  const shpFiles = await utils.unzip(fixturePath, /N03-\d{8}_\d{2}.shp/);
  const shpFile = shpFiles[0];
  JG = new JpShapeConverter(shpFile, destBaseDir);
  simplifyGeojson = await JG.simplifyGeojson(shpFile);
});

describe('japanGeojson', () => {
  test('Snapshot Test', async () => {
    const filePath = await JG.japanGeojson(simplifyGeojson);

    const geojson = await loadJson(filePath);
    expect(geojson).toMatchSnapshot();
  });
});

describe('japanDetailGeojson', () => {
  test('Snapshot Test', async () => {
    const filePath = await JG.japanDetailGeojson(simplifyGeojson);

    const geojson = await loadJson(filePath);
    expect(geojson).toMatchSnapshot();
  });
});

describe('japanAllPrefsGeojson', () => {
  test('Snapshot Test', async () => {
    const filePath = await JG.japanAllPrefsGeojson(simplifyGeojson);

    const geojson = await loadJson(filePath);
    expect(geojson).toMatchSnapshot();
  });
});

describe('japanPrefsGeojson', () => {
  beforeAll(async () => {
    await JG.japanGeojson(simplifyGeojson);
  });

  test('Snapshot Test', async () => {
    const inputGeoJson = path.join(destBaseDir, 'geojson', '00_japan.geojson');
    const outputDir = await JpShapeConverter.japanPrefsGeojson(inputGeoJson, 'geojson', destBaseDir);
    const filePath = path.join(outputDir, '14_kanagawa.geojson');
    const geojson = await loadJson(filePath);
    expect(geojson).toMatchSnapshot();
  });
});

describe('geo2topo', () => {
  beforeAll(async () => {
    await JG.japanGeojson(simplifyGeojson);
  });

  const outputTopoJson = path.join('/tmp', '/tmp.topojson');
  afterAll(async () => {
    await rm(outputTopoJson);
  });

  test('Snapshot Test', async () => {
    const outputDir = path.join(destBaseDir, 'geojson');
    const inputGeoJson = path.join(outputDir, '00_japan.geojson');
    await JpShapeConverter.geo2topo(inputGeoJson, outputTopoJson);
    const topojson = await loadJson(outputTopoJson);
    expect(topojson).toMatchSnapshot();
  });
});
