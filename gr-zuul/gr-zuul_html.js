/**
 * @license
 * Copyright (C) 2020 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const htmlTemplate = Polymer.html`
    <style include="gr-change-metadata-shared-styles">
    /* Workaround for empty style block - see https://github.com/Polymer/tools/issues/408 */
    </style>
    <template is="dom-if" if="[[_crd_loaded]]">
      <template is="dom-if" if="[[_crd.depends_on.length]]">
        <section class="zuul-dependency">
          <span class="title">Depends on</span>
          <span class="value">
            <template is="dom-repeat" items="[[_crd.depends_on]]">
              <a href$="[[_computeChangeIdLinkUrl(item)]]">
                [[item]]
              </a>
              <br/>
            </template>
          </span>
        </section>
      </template>
      <template is="dom-if" if="[[_crd.needed_by.length]]">
        <section class="zuul-dependency">
          <span class="title">Needed by</span>
          <span class="value">
            <template is="dom-repeat" items="[[_crd.needed_by]]">
              <a href$="[[_computeChangeIdLinkUrl(item)]]">
                [[item]]
              </a>
              <br/>
            </template>
          </span>
        </section>
      </template>
    </template>
`;

