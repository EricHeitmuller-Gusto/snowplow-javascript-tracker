/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { base64urlencode } from './base64';

/**
 * Type for a Payload dictionary
 */
export type Payload = Record<string, unknown>;

/**
 * Interface for mutable object encapsulating tracker payload
 */
export interface PayloadBuilder {
  /**
   * Sets whether the JSON within the payload should be base64 encoded
   * @param base64 Toggle for base64 encoding
   */
  setBase64Encoding: (base64: boolean) => void;

  /**
   * Adds an entry to the Payload
   * @param key Key for Payload dictionary entry
   * @param value Value for Payload dictionaty entry
   */
  add: (key: string, value: unknown) => void;

  /**
   * Merges a payload into the existing payload
   * @param dict The payload to merge
   */
  addDict: (dict: Payload) => void;

  /**
   * Caches a JSON object to be added to payload on build
   * @param keyIfEncoded key if base64 encoding is enabled
   * @param keyIfNotEncoded key if base64 encoding is disabled
   * @param json The json to be stringified and added to the payload
   */
  addJson: (keyIfEncoded: string, keyIfNotEncoded: string, json: Record<string, unknown>) => void;

  /**
   * Builds and returns the Payload
   * @param base64Encode configures if cached json should be encoded
   */
  build: () => Payload;
}

/**
 * Is property a non-empty JSON?
 * @param property Checks if object is non-empty json
 */
export function isNonEmptyJson(property?: Record<string, unknown>): boolean {
  if (!isJson(property)) {
    return false;
  }
  for (const key in property) {
    if (Object.prototype.hasOwnProperty.call(property, key)) {
      return true;
    }
  }
  return false;
}

/**
 * Is property a JSON?
 * @param property Checks if object is json
 */
export function isJson(property?: Record<string, unknown>): boolean {
  return (
    typeof property !== 'undefined' &&
    property !== null &&
    (property.constructor === {}.constructor || property.constructor === [].constructor)
  );
}

/**
 * A helper to build a Snowplow request from a set of name-value pairs, provided using the add methods.
 * Will base64 encode JSON, if desired, on build
 *
 * @return The request builder, with add and build methods
 */
export function payloadBuilder(): PayloadBuilder {
  const dict: Payload = {};
  const jsonForEncoding: Array<[string, string, Record<string, unknown>]> = [];
  let encodeBase64: boolean = true;

  const setBase64Encoding = (base64: boolean) => {
    encodeBase64 = base64;
  };

  const add = (key: string, value: unknown): void => {
    if (value != null && value !== '') {
      // null also checks undefined
      dict[key] = value;
    }
  };

  const addDict = (dict: Payload): void => {
    for (const key in dict) {
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        add(key, dict[key]);
      }
    }
  };

  const addJson = (keyIfEncoded: string, keyIfNotEncoded: string, json?: Record<string, unknown>): void => {
    if (json && isNonEmptyJson(json)) {
      jsonForEncoding.push([keyIfEncoded, keyIfNotEncoded, json]);
    }
  };

  const build = (): Payload => {
    for (const json of jsonForEncoding) {
      const str = JSON.stringify(json[2]);
      if (encodeBase64) {
        add(json[0], base64urlencode(str));
      } else {
        add(json[1], str);
      }
    }
    jsonForEncoding.length = 0;

    return dict;
  };

  return {
    setBase64Encoding,
    add,
    addDict,
    addJson,
    build,
  };
}
