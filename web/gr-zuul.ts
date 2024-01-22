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

import {PluginApi} from '@gerritcodereview/typescript-api/plugin';
import {ChangeInfo} from '@gerritcodereview/typescript-api/rest-api';
import {css, html, nothing, LitElement, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

declare global {
  interface HTMLElementTagNameMap {
    'gr-zuul': GrZuul;
  }
  interface Window {
    CANONICAL_PATH?: string;
  }
}

@customElement('gr-zuul')
export class GrZuul extends LitElement {

  @property({type: Object})
  plugin!: PluginApi;

  @property({type: Object})
  change?: ChangeInfo;

  @state()
  crd = {};

  @state()
  crdLoaded?: boolean;

  static override get styles() {
    return [
      css`
        section.related-changes-section {
          margin-bottom: 1.4em; /* Same as line height for collapse purposes */
          display: block;
        }
        div.foo {
          margin-bottom: 1.4em; /* Same as line height for collapse purposes */
        }
        a {
          display: block;
        }
        .changeContainer,
        a {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .changeContainer {
          display: flex;
        }
        .changeContainer.thisChange:before {
          content: '➔';
          width: 1.2em;
        }
        h4,
        section div {
          display: flex;
        }
        h4:before,
        section div:before {
          content: ' ';
          flex-shrink: 0;
          width: 1.2em;
        }
        .status {
          color: var(--deemphasized-text-color);
          font-weight: var(--font-weight-bold);
          margin-left: var(--spacing-xs);
        }
        /* The above styles are copy/paste from gr-related-changes-list_html.js */
        .dependencyCycleDetected {
          color: #d17171;
        }
        .missingFromThisServer {
          color: #d17171;
        }
        .hidden {
          display: none;
        }
      `,
    ];
  }

  override render() {
    return this.renderCrd();
  }

  private renderCrd() {
    if (!this.crdLoaded) return nothing;

    return this.renderDependsOnSection();
  }

  private renderDependsOnSection() {
    if (!this._isDependsOnSectionVisible) return nothing;

    return html`
      <section class="related-changes-section">
        <h4>Depends on</h4>
        ${this.crd.depends_on_found.map(
          item => this.renderDependsOnFound(item)
        )}
        ${this.crd.depends_on_missing.map(
          item => this.renderDependsOnMissing(item)
        )}

        ${this.renderNeededBy()}
      </section>
    `;
  }

  private renderDependsOnFound(item: Object) {
    return html`
      <div class="changeContainer zuulDependencyContainer">
        <a
          href=${this._computeDependencyUrl(item)}
          title=${this.createTitle(item)}
        >
          ${this.createTitle(item)}
        </a>
        <span class=${this._computeChangeStatusClass(item)}>
          (${this._computeChangeStatus(item)})
        </span>
        ${this.crd.cycle ?
          html`<span class="status dependencyCycleDetected">(Dependency cycle detected)</span>` : nothing}
      </div>
    `;
  }

  private renderDependsOnMissing(item: Object) {
    return html`
      <div class="changeContainer zuulDependencyContainer">
        <span>
          ${item}
        </span>
        <span class="status missingFromThisServer">
          (Missing from this server)
        </span>
      </div>
    `;
  }

  private renderNeededBy() {
    if (!this.crd.needed_by.length) return nothing;

    return html`
      <section class="related-changes-section">
        <h4>Needed by</h4>
        ${this.crd.needed_by.map(
          item => html`
            <div class="changeContainer zuulDependencyContainer">
              <a
                href=${this._computeDependencyUrl(item)}
                title=${this.createTitle(item)}
              >
              ${this.createTitle(item)}
              </a>
              <span class=${this._computeChangeStatusClass(item)}>
                (${this._computeChangeStatus(item)})
              </span>
              ${this.crd.cycle ? html`<span class="status dependencyCycleDetected">(Dependency cycle detected)</span>` : nothing}
            </div>
          `
        )}
      </section>
    `;
  }

  update(changedProperties: PropertyValues) {
    if (changedProperties.has('change')) {
      this._onChangeChanged();
    }
    super.update(changedProperties);
  }

  _onChangeChanged() {
    this.crdLoaded = false;
    this.setHidden(true);
    const url = '/changes/' + this.change.id + '/revisions/current/crd';
    return this.plugin.restApi().send('GET', url).then(crd => {
      this.crd = crd;
      this.crdLoaded = true;
      this.setHidden(!(this._isDependsOnSectionVisible()
                       || crd.needed_by.length));
    });
  }

  // copied from gr-related-changes-list.js, which is inaccessible from here.
  // Resolved uses of `this.ChangeStatus.[...]`, as that's inaccessible from here too.
  // Removed _isIndirectAncestor check, as the needed data is inaccessible from here.
  // Not all code paths are reachable, as we only have shallow ChangeInfo objects. We leave the
  // code here nonetheless, to allow for easier updating from gr-related-changes-list.js.
  _computeChangeStatusClass(change) {
    const classes = ['status'];
    if (change._revision_number != change._current_revision_number) {
      classes.push('notCurrent');
    } else if (change.submittable) {
      classes.push('submittable');
    } else if (change.status == 'NEW') {
      classes.push('hidden');
    }
    return classes.join(' ');
  }

  // copied from gr-related-changes-list.js, which is inaccessible from here.
  // Resolved uses of `this.ChangeStatus.[...]`, as that's inaccessible from here too.
  // Removed _isIndirectAncestor check, as the needed data is inaccessible from here.
  // Not all code paths are reachable, as we only have shallow ChangeInfo objects. We leave the
  // code here nonetheless, to allow for easier updating from gr-related-changes-list.js.
  _computeChangeStatus(change) {
    switch (change.status) {
      case 'MERGED':
        return 'Merged';
      case 'ABANDONED':
        return 'Abandoned';
    }
    if (change._revision_number != change._current_revision_number) {
      return 'Not current';
    } else if (change.submittable) {
      return 'Submittable';
    }
    return '';
  }

  setHidden(hidden) {
    if (this.hidden != hidden) {
      this.hidden = hidden;

      // Flag to parents that something changed
      this.dispatchEvent(new CustomEvent('new-section-loaded', {
        composed: true, bubbles: true,
      }));
    }
  }

  _computeDependencyUrl(changeInfo) {
    return `${window.CANONICAL_PATH || ''}/q/${changeInfo.change_id}`;
  }

  _isDependsOnSectionVisible() {
    return !!(this.crd.depends_on_found.length
              + this.crd.depends_on_missing.length);
  }

  private createTitle(item: Object) {
    return `${item.project}: ${item.branch}: ${item.subject}`;
  }
}
