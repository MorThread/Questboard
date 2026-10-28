"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";

type Quest = {
  id: number;
  title: string;
  detail: string;
  xp: number;
  done: boolean;
};

const starterQuests: Quest[] = [
  { id: 1, title: "Plan the week", detail: "Pick three things that matter", xp: 25, done: true },
  { id: 2, title: "Take a short walk", detail: "A little fresh air counts", xp: 40, done: true },
  { id: 3, title: "Read for 20 minutes", detail: "One page at a time", xp: 30, done: false },
  { id: 4, title: "Tidy one small space", detail: "Keep it easy and doable", xp: 35, done: false },
];

const goals = [
  { title: "Learn something new", category: "Curiosity", progress: 62, color: "bg-violet-500", icon: "✦" },
  { title: "Move a little every day", category: "Wellbeing", progress: 38, color: "bg-emerald-500", icon: "☀" },
];

export default function Home() {
  const [quests, setQuests] = useState(starterQuests);
  const [showForm, setShowForm] = useState(false);
  const [newQuest, setNewQuest] = useState("");
  const [notice, setNotice] = useState("");

  const completedCount = quests.filter((quest) => quest.done).length;
  const xp = 620 + quests.filter((quest) => quest.done).reduce((total, quest) => total + quest.xp, 0);
  const xpIntoLevel = xp % 1000;
  const xpPercent = Math.min((xpIntoLevel / 1000) * 100, 100);

  function toggleQuest(id: number) {
    setQuests((current) =>
      current.map((quest) => (quest.id === id ? { ...quest, done: !quest.done } : quest)),
    );
  }

  function addQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newQuest.trim();
    if (!title) return;

    setQuests((current) => [
      ...current,
      { id: Date.now(), title, detail: "A new little adventure", xp: 25, done: false },
    ]);
    setNewQuest("");
    setShowForm(false);
    setNotice("Quest added! You’ve got this.");
    window.setTimeout(() => setNotice(""), 2800);
  }

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
            <Link href="/" className="flex items-center gap-3 rounded-xl bg-[#eeeaff] px-3 py-3 text-sm font-semibold text-[#6048c4]">
              <span aria-hidden="true">⌂</span> Overview
            </Link>
            <a href="#today" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#6e6a7c] hover:bg-[#f1eff8]">
              <span aria-hidden="true">⚑</span> Today’s quests
            </a>
            <a href="#goals" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#6e6a7c] hover:bg-[#f1eff8]">
              <span aria-hidden="true">✧</span> My goals
            </a>
            <Link href="/achievements" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#6e6a7c] hover:bg-[#f1eff8]">
              <span aria-hidden="true">🏆</span> Achievements
            </Link>
          </nav>

          <div className="mt-auto rounded-2xl bg-[#f0ecff] p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#6855b5]">
              <span>WEEKLY ADVENTURE</span><span>3/5</span>
            </div>
            <p className="text-sm font-bold">You’re building a streak!</p>
            <p className="mt-1 text-xs leading-5 text-[#77708f]">A few small steps make a big journey.</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full w-3/5 rounded-full bg-[#8a72eb]" />
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
          <header className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="grid size-10 place-items-center rounded-xl bg-[#7157d9] text-white">✦</span>
              <span className="font-black">questboard</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm text-[#898596]">A fresh page, a fresh adventure</p>
            </div>
            <button type="button" className="flex items-center gap-2 rounded-full border border-[#e9e5dc] bg-white px-3 py-2 text-sm font-semibold shadow-sm">
              <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#ffe1bd] text-[10px] font-bold text-[#6048c4]">
                <span aria-hidden="true">KG</span>
                <Image
                  src="/profile.png"
                  alt="Kurt Kenji S. Gonzales"
                  fill
                  sizes="28px"
                  className="object-cover"
                  onError={(event) => { event.currentTarget.style.display = "none"; }}
                />
              </span>
              <span className="hidden sm:inline">Kurt Kenji S. Gonzales</span>
              <span aria-hidden="true" className="text-[#9a95a6]">⌄</span>
            </button>
          </header>

          <div id="overview" className="mb-8">
            <p className="mb-2 text-sm font-semibold text-[#806ad4]">YOUR ADVENTURE, YOUR PACE</p>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Hey, Kurt Kenji <span aria-hidden="true">🌱</span></h1>
                <p className="mt-2 text-[#777384]">Small steps still move you forward. What feels good to tackle today?</p>
              </div>
              <button type="button" onClick={() => setShowForm(true)} className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#7157d9] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-[#6048c4]">
                <span aria-hidden="true">＋</span> Add a quest
              </button>
            </div>
          </div>

          <div className="mb-7 grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
            <article className="rounded-3xl bg-[#30284e] p-6 text-white shadow-lg shadow-violet-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-violet-200">LEVEL 4 ADVENTURER</p>
                  <p className="mt-2 text-2xl font-black">The Curious Explorer</p>
                </div>
                <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-2xl">🗺️</span>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-violet-100">
                <span>{xpIntoLevel} / 1,000 XP</span><span>Level 5 next</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-[#ffc76a] transition-all" style={{ width: xpPercent + "%" }} />
              </div>
            </article>

            <article className="rounded-3xl border border-[#eee9df] bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#898596]">DAILY STREAK</p><span className="text-2xl">🔥</span>
              </div>
              <p className="mt-3 text-4xl font-black">5 <span className="text-base font-semibold text-[#898596]">days</span></p>
              <p className="mt-2 text-sm text-[#777384]">You showed up for yourself.</p>
            </article>

            <article className="rounded-3xl border border-[#eee9df] bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#898596]">TODAY’S PROGRESS</p><span className="text-2xl">🌼</span>
              </div>
              <p className="mt-3 text-4xl font-black">{completedCount}<span className="text-xl text-[#aaa5b5]">/{quests.length}</span></p>
              <p className="mt-2 text-sm text-[#777384]">quests completed today</p>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <section id="today" className="rounded-3xl border border-[#eee9df] bg-white p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#806ad4]">TODAY</p>
                  <h2 className="mt-1 text-xl font-black">Your quests</h2>
                </div>
                <span className="rounded-full bg-[#f4f1ff] px-3 py-1.5 text-xs font-semibold text-[#6955bd]">{completedCount} complete</span>
              </div>
              <div className="space-y-3">
                {quests.map((quest) => (
                  <button key={quest.id} type="button" onClick={() => toggleQuest(quest.id)} aria-pressed={quest.done} className="flex w-full items-center gap-3 rounded-2xl border border-[#f0edf4] p-4 text-left transition hover:border-[#d8cff8] hover:bg-[#fcfbff]">
                    <span className={"grid size-6 shrink-0 place-items-center rounded-full border text-xs " + (quest.done ? "border-[#7157d9] bg-[#7157d9] text-white" : "border-[#d8d3e0] text-transparent")}>✓</span>
                    <span className="min-w-0 flex-1">
                      <span className={"block truncate text-sm font-bold " + (quest.done ? "text-[#928e9c] line-through" : "text-[#343044]")}>{quest.title}</span>
                      <span className="mt-1 block truncate text-xs text-[#9995a3]">{quest.detail}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-[#fff5df] px-2.5 py-1 text-xs font-bold text-[#9b6a19]">+{quest.xp} XP</span>
                  </button>
                ))}
              </div>
            </section>

            <section id="goals" className="rounded-3xl border border-[#eee9df] bg-white p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#806ad4]">THE BIG PICTURE</p>
                  <h2 className="mt-1 text-xl font-black">Active goals</h2>
                </div>
                <button type="button" className="rounded-lg px-3 py-2 text-sm font-bold text-[#7157d9] hover:bg-[#f4f1ff]">See all</button>
              </div>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <article key={goal.title} className="rounded-2xl bg-[#faf9fc] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-white text-lg shadow-sm">{goal.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold">{goal.title}</h3>
                          <p className="mt-1 text-xs text-[#9691a0]">{goal.category}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#777384]">{goal.progress}%</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eae7ef]">
                      <div className={"h-full rounded-full " + goal.color} style={{ width: goal.progress + "%" }} />
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-dashed border-[#d9d1f1] p-4 text-center">
                <p className="text-sm font-semibold">Got a new dream?</p>
                <p className="mt-1 text-xs text-[#918c9c]">Add a goal and make it yours.</p>
              </div>
            </section>
          </div>

          <footer className="mt-7 flex flex-col gap-2 rounded-2xl bg-[#eeeaff] px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-[#58499e]">You don’t have to do it all today. Just one quest is a win. ✨</p>
            <p className="text-xs text-[#827aa4]">Demo data · saved in this page only</p>
          </footer>
        </section>
      </div>

      {notice && <div role="status" className="fixed bottom-5 right-5 rounded-xl bg-[#30284e] px-5 py-3 text-sm font-semibold text-white shadow-xl">{notice}</div>}

      {showForm && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-[#201b35]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="new-quest-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#806ad4]">A fresh start</p>
                <h2 id="new-quest-title" className="mt-1 text-2xl font-black">Add a quest</h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-[#f5f3f8] text-lg">×</button>
            </div>
            <form onSubmit={addQuest}>
              <label htmlFor="quest-title" className="mb-2 block text-sm font-semibold">What would you like to do?</label>
              <input id="quest-title" autoFocus value={newQuest} onChange={(event) => setNewQuest(event.target.value)} placeholder="e.g. Sketch for 15 minutes" className="w-full rounded-xl border border-[#ddd8e7] px-4 py-3 text-sm outline-none focus:border-[#806ad4] focus:ring-4 focus:ring-violet-100" />
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#777384] hover:bg-[#f5f3f8]">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#7157d9] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6048c4]">Add quest</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

