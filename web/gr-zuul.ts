/**
 * @license
 * Copyright (C) 2025 The Android Open Source Project
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

import {ChangeInfo} from '@gerritcodereview/typescript-api/rest-api';
import {LitElement, html, css, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

interface CrdInfo {
  depends_on_found?: ChangeInfo[];
  depends_on_missing?: string[];
  needed_by?: ChangeInfo[];
  cycle?: boolean;
}

@customElement('gr-zuul')
export class GrZuul extends LitElement {
  @property({type: Object}) change?: ChangeInfo;
  @property({type: Boolean, reflect: true}) hidden = true;

  @state() private _crd: CrdInfo = {};
  @state() private _crdLoaded = false;

  static override get styles() {
    return [
      css`
        section.related-changes-section {
          margin-bottom: 1.4em;
          display: block;
        }
        a {
          display: block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .changeContainer {
          display: flex;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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
        .dependencyCycleDetected,
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
    if (!this._crdLoaded) return nothing;

    return html`
      ${this._isDependsOnSectionVisible()
        ? html`
            <section class="related-changes-section">
              <h4>Depends on</h4>
              ${this._crd.depends_on_found?.map(
                item => html`
                  <div class="changeContainer zuulDependencyContainer">
                    <a
                      href=${this._computeDependencyUrl(item)}
                      title="${item.project}: ${item.branch}: ${item.subject}"
                    >
                      ${item.project}: ${item.branch}: ${item.subject}
                    </a>
                    <span class=${this._computeChangeStatusClass(item)}>
                      (${this._computeChangeStatus(item)})
                    </span>
                    ${this._crd.cycle
                      ? html`
                          <span class="status dependencyCycleDetected">
                            (Dependency cycle detected)
                          </span>
                        `
                      : nothing}
                  </div>
                `
              )}
              ${this._crd.depends_on_missing?.map(
                item => html`
                  <div class="changeContainer zuulDependencyContainer">
                    <span>${item}</span>
                    <span class="status missingFromThisServer">
                      (Missing from this server)
                    </span>
                  </div>
                `
              )}
            </section>
          `
        : nothing}

      ${this._crd.needed_by?.length
        ? html`
            <section class="related-changes-section">
              <h4>Needed by</h4>
              ${this._crd.needed_by.map(
                item => html`
                  <div class="changeContainer zuulDependencyContainer">
                    <a
                      href=${this._computeDependencyUrl(item)}
                      title="${item.project}: ${item.branch}: ${item.subject}"
                    >
                      ${item.project}: ${item.branch}: ${item.subject}
                    </a>
                    <span class=${this._computeChangeStatusClass(item)}>
                      (${this._computeChangeStatus(item)})
                    </span>
                    ${this._crd.cycle
                      ? html`
                          <span class="status dependencyCycleDetected">
                            (Dependency cycle detected)
                          </span>
                        `
                      : nothing}
                  </div>
                `
              )}
            </section>
          `
        : nothing}
    `;
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('change')) {
      void this._onChangeChanged();
    }
  }

  private async _onChangeChanged(): Promise<void> {
    this._crdLoaded = false;
    this._setHidden(true);
    if (!this.change?.id) return;

    const url = `/changes/${this.change.id}/revisions/current/crd`;
    const plugin = (this as any).plugin;

    const crd: CrdInfo = await plugin.restApi().send('GET', url);
    this._crd = crd;
    this._crdLoaded = true;

    const visible = this._isDependsOnSectionVisible() || (crd.needed_by?.length ?? 0) > 0;
    this._setHidden(!visible);
  }

  private _setHidden(hidden: boolean): void {
    if (this.hidden !== hidden) {
      this.hidden = hidden;
      this.dispatchEvent(
        new CustomEvent('new-section-loaded', {
          composed: true,
          bubbles: true,
        })
      );
    }
  }

  private _computeChangeStatusClass(change: ChangeInfo): string {
    const classes = ['status'];
    if (change._revision_number !== change._current_revision_number) {
      classes.push('notCurrent');
    } else if (change.submittable) {
      classes.push('submittable');
    } else if (change.status === 'NEW') {
      classes.push('hidden');
    }
    return classes.join(' ');
  }

  private _computeChangeStatus(change: ChangeInfo): string {
    switch (change.status) {
      case 'MERGED':
        return 'Merged';
      case 'ABANDONED':
        return 'Abandoned';
      default:
        if (change._revision_number !== change._current_revision_number) {
          return 'Not current';
        } else if (change.submittable) {
          return 'Submittable';
        }
        return '';
    }
  }

  private _computeDependencyUrl(changeInfo: ChangeInfo): string {
    const base = (window as any).CANONICAL_PATH || '';
    return `${base}/q/${changeInfo.change_id}`;
  }

  private _isDependsOnSectionVisible(): boolean {
    const {depends_on_found, depends_on_missing} = this._crd;
    return (depends_on_found?.length ?? 0) + (depends_on_missing?.length ?? 0) > 0;
  }
}
