/**
 * InteractiveSection — simplified stub of portfolio/InteractiveSection.
 *
 * The source prototype renders a streaming-chat AI assistant. For the
 * customer-facing proposal we strip that (no API key, no streaming infra, and
 * security/compliance concerns around an un-gated LLM) and swap in a "Have
 * questions?" CTA block with preset prompts that deep-link into a prefilled
 * mailto — the customer's assigned rep handles the actual answer.
 */

import type { ProposalViewModel } from '@/lib/proposal/adapter';
import { MailIcon, PhoneIcon, ArrowRightIcon } from './icons';

interface InteractiveSectionProps {
  vm: ProposalViewModel;
}

const PRESETS: ReadonlyArray<string> = [
  "What's excluded from make-ready?",
  'Does this include a warranty?',
  'What rebates are available?',
  'Can we phase the install?',
];

function buildMailtoHref(
  repEmail: string | undefined,
  proposalId: string,
  question: string
): string {
  const to = repEmail && repEmail.includes('@') ? repEmail : 'hello@bulletev.com';
  const subject = encodeURIComponent(
    `Question on proposal ${proposalId}: ${question}`
  );
  const body = encodeURIComponent(
    `Hi team,\n\n${question}\n\n(Proposal: ${proposalId})\n`
  );
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

function buildTelHref(phone: string | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.length >= 7 ? `tel:${digits}` : null;
}

export function InteractiveSection({ vm }: InteractiveSectionProps) {
  // The customer-view estimate doesn't carry the rep's email directly. Fall
  // back to a shared inbox; the actual rep is named in the footer.
  const repEmail = vm.customer.contactEmail;
  const telHref = buildTelHref(vm.customer.contactPhone);

  return (
    <section className="py-20 md:py-28 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="reveal text-center mb-10">
          <p className="pp-eyebrow mb-3">Have questions?</p>
          <h2 className="pp-section-title text-3xl md:text-5xl font-bold pp-text-foreground">
            Questions?
          </h2>
          <p className="pp-text-muted mt-4 text-base md:text-lg leading-relaxed">
            Your rep{' '}
            <span className="font-semibold pp-text-foreground">{vm.preparedBy}</span>{' '}
            can walk through any part of this proposal — pricing, equipment,
            rebates, install steps.
          </p>
        </div>

        <div
          className="reveal clay-surface p-6 md:p-8"
          style={{ background: 'hsl(var(--pp-background))' }}
        >
          <p className="text-xs uppercase tracking-[0.15em] pp-text-muted font-medium mb-4">
            Common questions
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {PRESETS.map((q) => (
              <a
                key={q}
                href={buildMailtoHref(repEmail, vm.proposalId, q)}
                className="text-xs px-3 py-1.5 rounded-full border pp-border pp-text-muted hover:pp-text-foreground transition-colors"
              >
                {q}
              </a>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <a
              href={buildMailtoHref(repEmail, vm.proposalId, 'I have a question about my proposal')}
              className="clay-btn-primary press-effect px-6 py-3 text-sm flex-1 justify-center"
            >
              <MailIcon className="w-4 h-4" />
              Ask your rep
              <ArrowRightIcon className="w-4 h-4" />
            </a>
            {telHref && (
              <a
                href={telHref}
                className="clay-btn-ghost press-effect px-6 py-3 text-sm flex-1 justify-center pp-text-foreground"
                style={{
                  background: 'hsl(var(--pp-secondary))',
                  border: '1px solid hsl(var(--pp-border))',
                }}
              >
                <PhoneIcon className="w-4 h-4" />
                {vm.customer.contactPhone}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveSection;
