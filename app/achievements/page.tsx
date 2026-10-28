"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

const startDate = new Date(2026, 6, 27);

const skills = [
  { name: "Visual Studio", note: "IDE and development workflow", icon: "⌘" },
  { name: "HTML & CSS", note: "Structure and styling for the web", icon: "◇" },
  { name: "JavaScript", note: "Interactive web applications", icon: "JS" },
  { name: "Microsoft SQL", note: "Queries, data, and reporting", icon: "▤" },
  { name: "Crystal Reports", note: "Business reports and layouts", icon: "▧" },
];

const proficiencyLevels = ["Not rated", "Learning", "Developing", "Working", "Confident", "Strong"];

function getTenure(now: Date) {
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days };
}

function dateAfterMonths(months: number) {
  return new Date(startDate.getFullYear(), startDate.getMonth() + months, startDate.getDate());
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function AchievementsPage() {
  const [today, setToday] = useState<Date | null>(null);
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [customAchievements, setCustomAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState("");

  useEffect(() => {
    const updateDate = () => setToday(new Date());
    updateDate();
    const timer = window.setInterval(updateDate, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  function addAchievement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newAchievement.trim();
    if (!title) return;
    setCustomAchievements((items) => [title, ...items]);
    setNewAchievement("");
  }

  const tenure = today ? getTenure(today) : null;
  const milestones = [
    { label: "First month", months: 1 },
    { label: "Three months", months: 3 },
    { label: "Six months", months: 6 },
    { label: "One year", months: 12 },
  ];

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#29263a]">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e9e5dc] bg-[#fbfaf7] px-6 py-7 lg:flex">
          <Link href="/" className="mb-12 flex items-center gap-3" aria-label="Questboard home">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#7157d9] text-xl text-white shadow-md shadow-violet-200">✦</span>
            <span>
              <span className="block text-lg font-black tracking-tight">questboard</span>
              <span className="block text-xs text-[#888398]">your life, one quest at a time</span>
            </span>
          </Link>

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#aaa5b5]">Your space</p>
          <nav className="space-y-1" aria-label="Main navigation">
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#6e6a7c] hover:bg-[#f1eff8]">
              <span aria-hidden="true">⌂</span> Overview
            </Link>
            <Link href="/#today" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#6e6a7c] hover:bg-[#f1eff8]">
              <span aria-hidden="true">⚑</span> Today’s quests
            </Link>
            <Link href="/#goals" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#6e6a7c] hover:bg-[#f1eff8]">
              <span aria-hidden="true">✧</span> My goals
            </Link>
            <Link href="/achievements" aria-current="page" className="flex items-center gap-3 rounded-xl bg-[#eeeaff] px-3 py-3 text-sm font-semibold text-[#6048c4]">
              <span aria-hidden="true">🏆</span> Achievements
            </Link>
          </nav>

          <div className="mt-auto rounded-2xl bg-[#f0ecff] p-4">
            <p className="text-xs font-semibold text-[#6855b5]">YOUR CAREER STORY</p>
            <p className="mt-2 text-sm font-bold">Built one step at a time.</p>
            <p className="mt-1 text-xs leading-5 text-[#77708f]">Keep track of the work and skills you’re growing.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[#898596]">A record of what you’ve learned and done</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm lg:hidden">
                <Link href="/" className="text-[#6e6a7c]">Overview</Link>
                <Link href="/#today" className="text-[#6e6a7c]">Quests</Link>
                <Link href="/achievements" aria-current="page" className="font-semibold text-[#6048c4]">Achievements</Link>
              </div>
            </div>
            <span className="rounded-full border border-[#e9e5dc] bg-white px-4 py-2 text-sm font-semibold">Kurt Kenji</span>
          </header>

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-[#806ad4]">YOUR CAREER, YOUR PROGRESS</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Achievements <span aria-hidden="true">🏆</span></h1>
            <p className="mt-2 max-w-2xl text-[#777384]">A place to mark the experience you’re building at Integr8 and the skills you’re developing.</p>
          </div>

          <section aria-labelledby="tenure-title" className="mb-7 rounded-3xl bg-[#30284e] p-6 text-white shadow-lg shadow-violet-100 sm:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold text-violet-200">INTEGR8 SOFTWARE SOLUTIONS INC.</p>
                <h2 id="tenure-title" className="mt-2 text-2xl font-black sm:text-3xl">Your time with the team</h2>
                <p className="mt-2 text-sm text-violet-100">Started {formatDate(startDate)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ["Years", tenure?.years],
                  ["Months", tenure?.months],
                  ["Days", tenure?.days],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-20 rounded-2xl bg-white/10 px-4 py-3">
                    <p className="text-3xl font-black">{value ?? "—"}</p>
                    <p className="mt-1 text-xs text-violet-100">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-5 text-xs text-violet-200">Live tenure count · updates while this page is open</p>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <section aria-labelledby="milestones-title" className="rounded-3xl border border-[#eee9df] bg-white p-5 sm:p-7">
              <div className="mb-5">
                <p className="text-sm font-semibold text-[#806ad4]">TIME AT INTEGR8</p>
                <h2 id="milestones-title" className="mt-1 text-xl font-black">Career milestones</h2>
              </div>
              <ol className="space-y-3">
                {milestones.map((milestone) => {
                  const date = dateAfterMonths(milestone.months);
                  const reached = today ? today >= date : false;
                  return (
                    <li key={milestone.label} className="flex items-center gap-3 rounded-2xl border border-[#f0edf4] p-4">
                      <span className={"grid size-9 shrink-0 place-items-center rounded-full text-sm " + (reached ? "bg-[#eeeaff] text-[#6048c4]" : "bg-[#f6f4f0] text-[#aaa5b5]")}>
                        {reached ? "✓" : "·"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">{milestone.label} at Integr8</span>
                        <span className="mt-1 block text-xs text-[#9995a3]">{formatDate(date)}</span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-[#777384]">{reached ? "Reached" : "Coming up"}</span>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section aria-labelledby="skills-title" className="rounded-3xl border border-[#eee9df] bg-white p-5 sm:p-7">
              <div className="mb-5">
                <p className="text-sm font-semibold text-[#806ad4]">SELF-ASSESSMENT</p>
                <h2 id="skills-title" className="mt-1 text-xl font-black">Skills in progress</h2>
                <p className="mt-1 text-xs text-[#9995a3]">Choose the level that feels accurate to you.</p>
              </div>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.name} className="flex flex-col gap-3 rounded-2xl bg-[#faf9fc] p-4 sm:flex-row sm:items-center">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-sm font-black text-[#6048c4] shadow-sm">{skill.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold">{skill.name}</h3>
                      <p className="mt-1 text-xs text-[#9691a0]">{skill.note}</p>
                    </div>
                    <label className="sr-only" htmlFor={`rating-${skill.name}`}>Rate {skill.name}</label>
                    <select
                      id={`rating-${skill.name}`}
                      value={ratings[skill.name] ?? "Not rated"}
                      onChange={(event) => setRatings((current) => ({ ...current, [skill.name]: event.target.value }))}
                      className="rounded-xl border border-[#e8e3ef] bg-white px-3 py-2 text-sm text-[#514b61] outline-none focus:border-[#806ad4] focus:ring-4 focus:ring-violet-100"
                    >
                      {proficiencyLevels.map((level) => <option key={level}>{level}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section aria-labelledby="personal-achievements-title" className="mt-6 rounded-3xl border border-[#eee9df] bg-white p-5 sm:p-7">
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#806ad4]">YOUR OWN WINS</p>
              <h2 id="personal-achievements-title" className="mt-1 text-xl font-black">Personal achievements</h2>
            </div>
            <form onSubmit={addAchievement} className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="achievement-title">Achievement title</label>
              <input id="achievement-title" value={newAchievement} onChange={(event) => setNewAchievement(event.target.value)} placeholder="e.g. Shipped my first feature" className="min-w-0 flex-1 rounded-xl border border-[#ddd8e7] px-4 py-3 text-sm outline-none focus:border-[#806ad4] focus:ring-4 focus:ring-violet-100" />
              <button type="submit" className="rounded-xl bg-[#7157d9] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#6048c4]">＋ Add achievement</button>
            </form>
            {customAchievements.length > 0 ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {customAchievements.map((achievement, index) => (
                  <li key={`${achievement}-${index}`} className="flex items-center gap-3 rounded-2xl bg-[#faf9fc] p-4 text-sm font-semibold">
                    <span className="grid size-8 place-items-center rounded-full bg-[#eeeaff] text-[#6048c4]">✓</span>{achievement}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-[#d9d1f1] p-4 text-center text-sm text-[#918c9c]">Your wins will show up here. Add one when you’re ready.</p>
            )}
          </section>

          <footer className="mt-6 rounded-2xl bg-[#eeeaff] px-5 py-4 text-xs text-[#6855b5]">
            These skill ratings and personal achievements are temporary page state for now; they aren’t saved to Supabase yet.
          </footer>
        </section>
      </div>
    </main>
  );
}
