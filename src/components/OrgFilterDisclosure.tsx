import { useId, useRef, useState } from 'react';
import { ChevronDown, ListFilter } from 'lucide-react';
import {
  ORGANISATION_GROUPS,
  ORGANISATION_GROUP_IDS,
  ORGANISATIONS,
  organisation,
} from '../lib/content';
import { ORG_FILTER_ID, ORG_SELECT_ID } from '../lib/focus';
import { fill, useLanguage } from '../lib/i18n';
import { setOrgFilter, useHasJs } from '../lib/router';
import { UI } from '../lib/strings';
import {
  isOrganisationId,
  type OrganisationId,
  NO_ORG_FILTER,
  type OrgFilter,
} from '../lib/types';
import { T } from './T';

const linkText = 'underline underline-offset-4 hover:decoration-2';

/**
 * "Filter by organisation": a quiet disclosure with a dropdown of the
 * organisations in `organisations`, a tick box for all-Wales work, and a
 * button to clear the filter. Used on the landing page and on roadmaps. Needs
 * JavaScript, so it is left out of the prerender.
 */
export function OrgFilterDisclosure({
  filter,
  organisations,
  defaultOpen = false,
  className = '',
}: {
  filter: OrgFilter;
  /** The organisations to offer, usually those with any work. */
  organisations: readonly OrganisationId[];
  defaultOpen?: boolean;
  className?: string;
}) {
  const { tr } = useLanguage();
  const hasJs = useHasJs();
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const selectRef = useRef<HTMLSelectElement>(null);

  const { org, includeNational } = filter;
  const options = ORGANISATIONS.filter(
    (o) => organisations.includes(o.id) || o.id === org,
  );
  if (!hasJs || options.length === 0) return null;

  return (
    <details
      id={ORG_FILTER_ID}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className={`group ${className}`}
    >
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-sm text-sm font-medium text-action [&::-webkit-details-marker]:hidden">
        <ListFilter aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className={linkText}>
          <T
            value={
              org
                ? fill(UI.filteredByOrganisation, {
                    organisation: organisation(org).short,
                  })
                : UI.filterByOrganisation
            }
          />
        </span>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="mt-3 max-w-xl rounded-card border border-border bg-surface p-4">
        <label
          htmlFor={ORG_SELECT_ID}
          className="block font-medium text-heading"
        >
          <T value={UI.organisationLabel} />
        </label>
        <p id={`${id}-org-hint`} className="mt-0.5 text-sm text-ink-700">
          <T value={UI.organisationHint} />
        </p>
        <select
          id={ORG_SELECT_ID}
          ref={selectRef}
          aria-describedby={`${id}-org-hint`}
          value={org ?? ''}
          onChange={(event) => {
            const { value } = event.target;
            setOrgFilter({
              org: isOrganisationId(value) ? value : null,
              includeNational,
            });
          }}
          className="mt-1 w-full rounded-sm border-2 border-ink-700 bg-surface px-3 py-2 text-base"
        >
          <option value="">{tr(UI.allOrganisations)}</option>
          {ORGANISATION_GROUP_IDS.map((group) => {
            const inGroup = options.filter((o) => o.group === group);
            return inGroup.length > 0 ? (
              <optgroup key={group} label={tr(ORGANISATION_GROUPS[group])}>
                {inGroup.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.code ? `${tr(o.name)} (${o.code})` : tr(o.name)}
                  </option>
                ))}
              </optgroup>
            ) : null;
          })}
        </select>

        {org && org !== 'national' ? (
          <div className="mt-4 flex items-start gap-3">
            <input
              id={`${id}-all`}
              type="checkbox"
              checked={includeNational}
              onChange={(event) =>
                setOrgFilter({ org, includeNational: event.target.checked })
              }
              aria-describedby={`${id}-all-hint`}
              className="mt-0.5 h-5 w-5 shrink-0 accent-heading"
            />
            <div>
              <label htmlFor={`${id}-all`} className="font-medium text-heading">
                <T value={UI.includeAllWales} />
              </label>
              <p id={`${id}-all-hint`} className="text-sm text-ink-700">
                <T value={UI.includeAllWalesHint} />
              </p>
            </div>
          </div>
        ) : null}

        {org ? (
          <p className="mt-4">
            <button
              type="button"
              onClick={() => {
                setOrgFilter(NO_ORG_FILTER);
                // The button goes, so move focus to the dropdown.
                selectRef.current?.focus();
              }}
              className={`text-sm font-medium text-action ${linkText}`}
            >
              <T value={UI.clearFilter} />
            </button>
          </p>
        ) : null}
      </div>
    </details>
  );
}
