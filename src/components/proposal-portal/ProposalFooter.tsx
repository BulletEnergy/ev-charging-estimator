/**
 * ProposalFooter — Bullet EV contact block + primary CTA.
 */

import Image from 'next/image';
import type { ProposalViewModel } from '@/lib/proposal/adapter';
import { MailIcon, PhoneIcon, ArrowRightIcon } from './icons';

interface ProposalFooterProps {
  vm: ProposalViewModel;
}

export function ProposalFooter({ vm }: ProposalFooterProps) {
  return (
    <footer
      className="py-16 md:py-20 px-6"
      style={{ background: 'hsl(var(--pp-surface-cool))' }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className="reveal clay-surface p-8 md:p-12 text-center"
          style={{ background: 'hsl(var(--pp-background))' }}
        >
          <div className="flex justify-center mb-6">
            <Image
              src="/brand/bulletev-logo.png"
              alt="BulletEV"
              width={160}
              height={36}
              className="h-8 md:h-9 w-auto"
            />
          </div>

          <h2 className="pp-section-title text-2xl md:text-3xl font-bold pp-text-foreground mb-3">
            Ready to move forward?
          </h2>
          <p className="pp-text-muted max-w-md mx-auto mb-8 leading-relaxed">
            Your proposal is valid for 30 days. Accept online or reach out with
            questions — your rep{' '}
            <span className="font-semibold pp-text-foreground">
              {vm.preparedBy}
            </span>{' '}
            is on call.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              type="button"
              className="clay-btn-primary press-effect px-8 py-3 text-sm"
            >
              Accept Estimate
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {(vm.customer.contactEmail || vm.customer.contactPhone) && (
            <dl className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 text-sm pp-text-muted max-w-lg mx-auto">
              {vm.customer.contactEmail && (
                <div className="flex items-center justify-center gap-2 min-w-0">
                  <MailIcon className="w-4 h-4 pp-text-primary shrink-0" />
                  <span className="truncate">{vm.customer.contactEmail}</span>
                </div>
              )}
              {vm.customer.contactPhone && (
                <div className="flex items-center justify-center gap-2 min-w-0">
                  <PhoneIcon className="w-4 h-4 pp-text-primary shrink-0" />
                  <span className="truncate">{vm.customer.contactPhone}</span>
                </div>
              )}
            </dl>
          )}
        </div>

        <p className="text-center text-xs pp-text-muted mt-8">
          Prepared by BulletEV &middot; Proposal #{vm.proposalId}
        </p>
      </div>
    </footer>
  );
}

export default ProposalFooter;
