// @ts-expect-error override
import nodeFetch from 'node-fetch';

window.fetch = nodeFetch;

export {};
