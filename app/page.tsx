"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Quest = {
  id: string;
  title: string;
  detail: string;
  xp: number;
  done: boolean;
};

type Completion = {
  quest_id: string;
  completed_on: string;
  xp_awarded: number;
};

const starterQuests = [
  { title: "Plan the week", detail: "Pick three things that matter", xp: 25 },
  { title: "Take a short walk", detail: "A little fresh air counts", xp: 40 },
  { title: "Read for 20 minutes", detail: "One page at a time", xp: 30 },
  { title: "Tidy one small space", detail: "Keep it easy and doable", xp: 35 },
  { title: "Complete a full shift as a DevOps Engineer at Integr8 Software Solutions", detail: "Great job! Keep it up and enhance your skills.", xp: 150 },
];

function singaporeDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

async function loadWorkspace(client: SupabaseClient, userId: string, date: string) {
  const questColumns = "id, title, detail, xp, created_at";
  let { data: savedQuests, error: questError } = await client
    .from("user_quests")
    .select(questColumns)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (questError) throw questError;

  if (!savedQuests?.length) {
    const seeded = await client
      .from("user_quests")
      .insert(starterQuests.map((quest) => ({ ...quest, user_id: userId })))
      .select(questColumns)
      .order("created_at", { ascending: true });
    if (seeded.error) throw seeded.error;
    savedQuests = seeded.data;
  }

  const [completionResult, noteResult] = await Promise.all([
    client
      .from("quest_completions")
      .select("quest_id, completed_on, xp_awarded")
      .order("completed_on", { ascending: false }),
    client
      .from("daily_notes")
      .select("note")
      .eq("log_date", date)
      .maybeSingle(),
  ]);

  if (completionResult.error) throw completionResult.error;
  if (noteResult.error) throw noteResult.error;

  const completions = (completionResult.data ?? []) as Completion[];
  const completedToday = new Set(
    completions.filter((item) => item.completed_on === date).map((item) => item.quest_id),
  );

  return {
    quests: (savedQuests ?? []).map((quest) => ({
      ...quest,
      done: completedToday.has(quest.id),
    })) as Quest[],
    completions,
    dailyNote: noteResult.data?.note ?? "",
  };
}

function getStreak(completions: Completion[], today: string) {
  const days = new Set(completions.map((item) => item.completed_on));
  const shiftDate = (date: string, shift: number) => {
    const value = new Date(`${date}T00:00:00.000Z`);
    value.setUTCDate(value.getUTCDate() + shift);
    return value.toISOString().slice(0, 10);
  };

  let day = days.has(today) ? today : shiftDate(today, -1);
  if (!days.has(day)) return 0;

  let streak = 0;
  while (days.has(day)) {
    streak += 1;
    day = shiftDate(day, -1);
  }
  return streak;
}

const goals = [
  { title: "Learn something new", category: "Curiosity", progress: 62, color: "bg-violet-500", icon: "✦" },
  { title: "Move a little every day", category: "Wellbeing", progress: 38, color: "bg-emerald-500", icon: "☀" },
];

export default function Home() {
  const [supabase] = useState(getSupabaseBrowserClient);
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [dailyNote, setDailyNote] = useState("");
  const [today, setToday] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [dataError, setDataError] = useState("");
  const [savingQuestId, setSavingQuestId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newQuest, setNewQuest] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const updateDate = () => setToday(singaporeDate());
    updateDate();
    const timer = window.setInterval(updateDate, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const syncUser = async (nextUser: User | null) => {
      if (!active) return;
      setUser(nextUser);
      setDataError("");

      if (!nextUser) {
        setQuests([]);
        setCompletions([]);
        setDailyNote("");
        setDataLoading(false);
        setAuthLoading(false);
        return;
      }

      if (!today) return;
      setDataLoading(true);
      try {
        const workspace = await loadWorkspace(supabase, nextUser.id, today);
        if (!active) return;
        setQuests(workspace.quests);
        setCompletions(workspace.completions);
        setDailyNote(workspace.dailyNote);
      } catch (error) {
        if (active) setDataError(error instanceof Error ? error.message : "Could not load Questboard data.");
      } finally {
        if (active) {
          setDataLoading(false);
          setAuthLoading(false);
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      window.setTimeout(() => void syncUser(session?.user ?? null), 0);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) setDataError(error.message);
      void syncUser(data.session?.user ?? null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, today]);

  const completedCount = quests.filter((quest) => quest.done).length;
  const xp = completions.reduce((total, completion) => total + completion.xp_awarded, 0);
  const level = Math.floor(xp / 1000) + 1;
  const xpIntoLevel = xp % 1000;
  const xpPercent = Math.min((xpIntoLevel / 1000) * 100, 100);
  const streak = today ? getStreak(completions, today) : 0;

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setAuthMessage("");
    const result = authMode === "sign-up"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setAuthMessage(result.error.message);
    } else if (authMode === "sign-up" && !result.data.session) {
      setAuthMessage("Account created. Check your email to confirm it, then sign in here.");
    } else {
      setAuthMessage("Signed in. Loading your quests…");
    }
  }

  async function toggleQuest(id: string) {
    if (!supabase || !user || savingQuestId) return;
    const quest = quests.find((item) => item.id === id);
    if (!quest || quest.done) return;

    setSavingQuestId(id);
    setDataError("");
    try {
      const { data: inserted, error } = await supabase.rpc("complete_daily_quest", { p_quest_id: id });
      if (error) throw error;
      const workspace = await loadWorkspace(supabase, user.id, today);
      setQuests(workspace.quests);
      setCompletions(workspace.completions);
      setDailyNote(workspace.dailyNote);
      setNotice(inserted ? "Completion saved for today!" : "That quest is already recorded for today.");
      window.setTimeout(() => setNotice(""), 2800);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Could not save this completion.");
    } finally {
      setSavingQuestId(null);
    }
  }

  async function addQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newQuest.trim();
    if (!title || !supabase || !user) return;

    const { data, error } = await supabase
      .from("user_quests")
      .insert({ user_id: user.id, title, detail: "A new little adventure", xp: 25 })
      .select("id, title, detail, xp")
      .single();
    if (error) {
      setDataError(error.message);
      return;
    }

    setQuests((current) => [...current, { ...data, done: false } as Quest]);
    setNewQuest("");
    setShowForm(false);
    setNotice("Quest added! You’ve got this.");
    window.setTimeout(() => setNotice(""), 2800);
  }

  async function saveDailyNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user || !today) return;

    setSavingNote(true);
    setDataError("");
    const { error } = await supabase.from("daily_notes").upsert({
      user_id: user.id,
      log_date: today,
      note: dailyNote,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,log_date" });
    setSavingNote(false);

    if (error) {
      setDataError(error.message);
      return;
    }
    setNotice("Daily note saved!");
    window.setTimeout(() => setNotice(""), 2800);
  }

  if (!supabase) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-5 py-10 text-[#29263a]">
        <section className="w-full max-w-xl rounded-3xl border border-[#eee9df] bg-white p-7 shadow-sm sm:p-9">
          <p className="text-sm font-semibold text-[#806ad4]">ONE-TIME CONNECTION SETUP</p>
          <h1 className="mt-2 text-2xl font-black">Connect Questboard to Supabase</h1>
          <p className="mt-3 text-sm leading-6 text-[#777384]">Create a <code className="rounded bg-[#f4f1ff] px-1">.env.local</code> file in the Questboard project folder and add your project URL and publishable key:</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-[#29263a] p-4 text-xs leading-6 text-white">{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key`}</pre>
          <p className="mt-4 text-xs leading-5 text-[#898596]">Find these under your Supabase project’s API settings. Use the publishable key, never a service-role or secret key. Restart the dev server after saving the file.</p>
        </section>
      </main>
    );
  }

  if (authLoading && !user) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f5ef] text-sm text-[#777384]">Connecting to your Questboard account…</main>;
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-5 py-10 text-[#29263a]">
        <section className="w-full max-w-md rounded-3xl border border-[#eee9df] bg-white p-7 shadow-sm sm:p-9">
          <p className="text-sm font-semibold text-[#806ad4]">QUESTBOARD ACCOUNT</p>
          <h1 className="mt-2 text-2xl font-black">{authMode === "sign-in" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-[#777384]">Your daily quests and notes will be saved to your account.</p>
          <form onSubmit={handleAuth} className="mt-6 space-y-4">
            <div>
              <label htmlFor="account-email" className="mb-2 block text-sm font-semibold">Email</label>
              <input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#ddd8e7] px-4 py-3 text-sm outline-none focus:border-[#806ad4] focus:ring-4 focus:ring-violet-100" />
            </div>
            <div>
              <label htmlFor="account-password" className="mb-2 block text-sm font-semibold">Password</label>
              <input id="account-password" type="password" autoComplete={authMode === "sign-in" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-[#ddd8e7] px-4 py-3 text-sm outline-none focus:border-[#806ad4] focus:ring-4 focus:ring-violet-100" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-[#7157d9] px-4 py-3 text-sm font-bold text-white hover:bg-[#6048c4]">{authMode === "sign-in" ? "Sign in" : "Sign up"}</button>
          </form>
          {authMessage && <p role="status" className="mt-4 rounded-xl bg-[#f4f1ff] p-3 text-sm text-[#6048c4]">{authMessage}</p>}
          <button type="button" onClick={() => { setAuthMode(authMode === "sign-in" ? "sign-up" : "sign-in"); setAuthMessage(""); }} className="mt-5 text-sm font-semibold text-[#7157d9] hover:underline">
            {authMode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </section>
      </main>
    );
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
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Hey, Morthread <span aria-hidden="true">🌱</span></h1>
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
                  <p className="text-sm font-medium text-violet-200">LEVEL {level} ADVENTURER</p>
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
              <p className="mt-3 text-4xl font-black">{streak} <span className="text-base font-semibold text-[#898596]">days</span></p>
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
              {dataError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{dataError}</p>}
              {dataLoading && <p className="mb-4 text-sm text-[#777384]">Loading your saved quests…</p>}
              <div className="space-y-3">
                {quests.map((quest) => (
                  <button key={quest.id} type="button" onClick={() => toggleQuest(quest.id)} disabled={quest.done || savingQuestId === quest.id || dataLoading} aria-pressed={quest.done} className="flex w-full items-center gap-3 rounded-2xl border border-[#f0edf4] p-4 text-left transition hover:border-[#d8cff8] hover:bg-[#fcfbff] disabled:cursor-default disabled:opacity-80">
                    <span className={"grid size-6 shrink-0 place-items-center rounded-full border text-xs " + (quest.done ? "border-[#7157d9] bg-[#7157d9] text-white" : "border-[#d8d3e0] text-transparent")}>✓</span>
                    <span className="min-w-0 flex-1">
                      <span className={"block truncate text-sm font-bold " + (quest.done ? "text-[#928e9c] line-through" : "text-[#343044]")}>{quest.title}</span>
                      <span className="mt-1 block truncate text-xs text-[#9995a3]">{quest.detail}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-[#fff5df] px-2.5 py-1 text-xs font-bold text-[#9b6a19]">+{quest.xp} XP</span>
                  </button>
                ))}
                {!dataLoading && quests.length === 0 && <p className="rounded-xl bg-[#faf9fc] p-4 text-sm text-[#777384]">No quests yet. Add one to get started.</p>}
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

          <section className="mt-6 rounded-3xl border border-[#eee9df] bg-white p-5 sm:p-7">
            <div className="mb-4">
              <p className="text-sm font-semibold text-[#806ad4]">DAILY LOG · {today}</p>
              <h2 className="mt-1 text-xl font-black">What did you do today?</h2>
            </div>
            <form onSubmit={saveDailyNote} className="space-y-3">
              <textarea aria-label="Today's note" value={dailyNote} onChange={(event) => setDailyNote(event.target.value)} rows={3} placeholder="Write a quick note about your day…" className="w-full resize-y rounded-xl border border-[#ddd8e7] px-4 py-3 text-sm outline-none focus:border-[#806ad4] focus:ring-4 focus:ring-violet-100" />
              <button type="submit" disabled={savingNote || dataLoading} className="rounded-xl bg-[#7157d9] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6048c4] disabled:opacity-60">{savingNote ? "Saving…" : "Save today’s note"}</button>
            </form>
          </section>

          <footer className="mt-7 flex flex-col gap-2 rounded-2xl bg-[#eeeaff] px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-[#58499e]">You don’t have to do it all today. Just one quest is a win. ✨</p>
            <div className="flex items-center gap-3">
              <p className="text-xs text-[#827aa4]">Signed in as {user.email} · saved in Supabase</p>
              <button type="button" onClick={() => void supabase?.auth.signOut()} className="text-xs font-semibold text-[#6048c4] hover:underline">Sign out</button>
            </div>
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

