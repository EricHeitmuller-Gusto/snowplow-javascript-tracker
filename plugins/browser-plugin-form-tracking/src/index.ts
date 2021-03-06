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

import { BrowserPlugin, BrowserTracker } from '@snowplow/browser-tracker-core';
import { DynamicContext } from '@snowplow/tracker-core';
import { TrackerAndFormConfiguration, FormTrackingConfig, addFormListeners, configureFormTracking } from './helpers';

const _trackers: Record<string, TrackerAndFormConfiguration> = {};

/**
 * A plugin which enabled automatic form tracking
 */
export function FormTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker: BrowserTracker) => {
      _trackers[tracker.id] = { tracker: tracker };
    },
  };
}

/** The form tracking configuration */
export interface FormTrackingConfiguration {
  /** The options which can be configured for the form tracking events */
  options?: FormTrackingConfig;
  /** The dyanmic context which will be evaluated for each form event */
  context?: DynamicContext | null;
}

/**
 * Enables automatic form tracking
 * An event will be fired when a form field is changed or a form submitted.
 * This can be called multiple times: only forms not already tracked will be tracked.
 *
 * @param configuration The form tracking configuration
 * @param trackers The tracker identifiers which the events will be sent to
 */
export function enableFormTracking(
  configuration: FormTrackingConfiguration = {},
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { options, context } = configuration;
  trackers.forEach((t) => {
    if (_trackers[t]) {
      if (_trackers[t].tracker.sharedState.hasLoaded) {
        configureFormTracking(_trackers[t], options);
        addFormListeners(_trackers[t], context);
      } else {
        _trackers[t].tracker.sharedState.registeredOnLoadHandlers.push(function () {
          configureFormTracking(_trackers[t], options);
          addFormListeners(_trackers[t], context);
        });
      }
    }
  });
}
