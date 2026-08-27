import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Icon from "@/components/ui/Icon";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { aiUseCases } from "@/data/ai";

export function AIUseCases() {
  return (
    <Section width="default" spacing="md">
      <SectionHeader
        align="center"
        eyebrow="06 — Applied AI"
        title="Where Intelligence"
        highlight="Actually Helps"
        description="Six places AI earns its keep inside a business system, each one working on records the organisation already owns."
      />

      <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {aiUseCases.map((useCase, index) => (
          <StaggerItem as="article" key={useCase.title} className="h-full">
            <div className="ng-card group relative flex h-full flex-col overflow-hidden rounded-ng-card p-6 hover:-translate-y-1 hover:border-ng-line2 hover:shadow-ng-lift">
              {/* Spec-sheet index. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-5 font-mono text-[0.6875rem] tracking-[0.18em] text-ng-faint/60 transition-colors duration-500 group-hover:text-ng-faint"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="grid size-11 place-items-center rounded-ng bg-gradient-to-br from-ng-violet/18 to-ng-cyan/12 text-ng-violet ring-1 ring-ng-violet/25 transition-[transform,color] duration-500 group-hover:scale-105 group-hover:text-ng-cyan">
                <Icon name={useCase.icon} className="size-5" strokeWidth={1.6} />
              </span>

              <h3 className="mt-5 pr-8 font-display text-lg font-semibold text-ng-fg">
                {useCase.title}
              </h3>
              <p className="mb-6 mt-2.5 text-sm leading-relaxed text-ng-muted">{useCase.body}</p>

              {/* "In practice" — real content, always visible, lifts on hover. */}
              <div className="mt-auto border-t border-ng-line pt-4 transition-colors duration-500 group-hover:border-ng-line2">
                <span className="font-mono text-[0.6875rem] uppercase tracking-widest text-ng-faint">
                  In practice
                </span>
                <p className="mt-2 flex translate-y-0.5 gap-2 font-mono text-sm leading-relaxed text-ng-fg2 opacity-80 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span aria-hidden="true" className="shrink-0 text-ng-cyan">
                    ›
                  </span>
                  <span className="min-w-0 break-words">{useCase.example}</span>
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export default AIUseCases;
