import { FEEDBACK_URL } from '../lib/links';
import { UI } from '../lib/strings';
import { T } from './T';

/** "Give feedback" in body text, opening the feedback issue form. */
export function FeedbackLink() {
  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-action underline underline-offset-4 hover:no-underline"
    >
      <T value={UI.giveFeedback} />
    </a>
  );
}
