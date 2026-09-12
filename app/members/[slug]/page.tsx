"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, GraduationCap, Briefcase, MapPin, Lock } from "lucide-react";
import { Wrap, Section, Avatar, PageSkeleton } from "@/components/ui";
import { useDirectory, nameOf } from "@/lib/directory";
import { useAccess } from "@/lib/access";
import { initialsOf } from "@/lib/mock-auth";

/**
 * A member's public profile. The route param is their user id.
 * Email is never exposed — members connect through in-app messaging.
 */
export default function MemberProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const access = useAccess();
  const { members, loading } = useDirectory(access.signedIn);

  if (access.loading || loading) return <PageSkeleton />;

  if (!access.fullAccess) {
    return (
      <Section>
        <Wrap className="max-w-[520px]">
          <div className="rounded-2xl border border-line bg-white p-10 text-center">
            <Lock className="mx-auto mb-4 h-8 w-8 text-ink-soft" strokeWidth={1.75} />
            <h1 className="mb-2 text-2xl font-semibold">Members only</h1>
            <p className="mb-6 text-[15px] text-ink-soft">
              Speakers&apos; Circle members can browse the directory and
              connect with each other.
            </p>
            <Link
              href="/pricing"
              className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              See membership
            </Link>
          </div>
        </Wrap>
      </Section>
    );
  }

  const member = members.find((m) => m.id === slug);

  if (!member) {
    return (
      <Section>
        <Wrap className="max-w-[520px] text-center">
          <h1 className="mb-3 text-2xl font-semibold">Member not found</h1>
          <Link href="/community" className="font-semibold text-brand hover:underline">
            Back to the community
          </Link>
        </Wrap>
      </Section>
    );
  }

  const rank = members.findIndex((m) => m.id === member.id) + 1;
  const name = nameOf(member);

  return (
    <Section>
      <Wrap className="max-w-[820px]">
        <Link
          href="/community"
          className="mb-6 inline-block text-[14px] font-semibold text-brand hover:underline"
        >
          Back to the community
        </Link>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="h-20 bg-brand" />
          <div className="px-8 pb-8">
            <div className="-mt-12 mb-4">
              <span className="inline-block rounded-full border-4 border-white bg-white">
                <Avatar
                  initials={initialsOf(name)}
                  size={96}
                  src={member.avatar_url}
                  alt={name}
                />
              </span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-semibold tracking-tight">
                  {name}
                </h1>
                {member.headline && (
                  <p className="text-[15.5px] text-ink-soft">{member.headline}</p>
                )}
              </div>
              <Link
                href="/messages"
                className="rounded-lg bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-brand-dark"
              >
                Message
              </Link>
            </div>

            {member.bio && (
              <p className="mt-5 max-w-[640px] text-[15px] leading-relaxed text-ink-soft">
                {member.bio}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {member.school && (
                <span className="flex items-center gap-2 rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                  <GraduationCap className="h-3.5 w-3.5" strokeWidth={2} />
                  {member.school}
                </span>
              )}
              {member.company && (
                <span className="flex items-center gap-2 rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                  <Briefcase className="h-3.5 w-3.5" strokeWidth={2} />
                  {member.job_title ? `${member.job_title} at ` : ""}
                  {member.company}
                </span>
              )}
              {member.location && (
                <span className="flex items-center gap-2 rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                  {member.location}
                </span>
              )}
            </div>

            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-brand hover:underline"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={2} />
                {name} on LinkedIn
              </a>
            )}

            <div className="mt-6 flex flex-wrap gap-8 border-t border-line pt-5">
              <div>
                <div className="text-xl font-semibold">
                  {member.points.toLocaleString()}
                </div>
                <div className="text-xs uppercase tracking-wide text-ink-soft">
                  Points
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold">#{rank}</div>
                <div className="text-xs uppercase tracking-wide text-ink-soft">
                  Rank
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold">
                  {member.lessons_completed}
                </div>
                <div className="text-xs uppercase tracking-wide text-ink-soft">
                  Lessons completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}
