import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const sections = [
  ["what-it-does", "What it does"],
  ["how-it-works", "How it works"],
  ["different-questions", "Different questions, separate answers"],
  ["why-it-exists", "Why it was built"],
  ["what-it-does-not-do", "What it does not do"],
  ["privacy", "Privacy & transparency"],
  ["definitions", "Role-definition methodology"],
  ["limitations", "Limitations"],
] as const;

const sectionIds = new Set(sections.map(([id]) => id));

function sectionIdFromHash(hash: string) {
  try {
    const sectionId = hash ? decodeURIComponent(hash.slice(1)) : "";
    return sectionIds.has(sectionId as (typeof sections)[number][0]) ? sectionId : undefined;
  } catch {
    return undefined;
  }
}

export function AboutPage() {
  const { hash } = useLocation();
  const hashSectionId = sectionIdFromHash(hash);
  const [isContentsDocked, setIsContentsDocked] = useState(() => Boolean(hashSectionId));
  const [activeSection, setActiveSection] = useState(hashSectionId ?? sections[0][0]);

  useEffect(() => {
    if (!hashSectionId) return;
    setIsContentsDocked(true);
    setActiveSection(hashSectionId);
  }, [hashSectionId]);

  useEffect(() => {
    if (!isContentsDocked || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      const visibleSections = entries.filter((entry) => entry.isIntersecting);
      if (!visibleSections.length) return;
      visibleSections.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
      setActiveSection(visibleSections[0].target.id);
    }, { rootMargin: "-18% 0px -65% 0px", threshold: 0 });

    sections.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [isContentsDocked]);

  return (
    <div className={`page-width article-page about-page${isContentsDocked ? " is-contents-docked" : ""}`}>
      <header>
        <span className="eyebrow">About KinkAtlas</span>
        <h1>
          Clearer language.
          <br />
          <em>Your own meaning.</em>
        </h1>
        <p className="lede">A private tool for adult self-reflection, not an authority on who you are.</p>
      </header>
      <nav className={`about-contents${isContentsDocked ? " is-docked" : ""}`} aria-label="About sections">
        {sections.map(([id, title]) => (
          <a key={id} href={`#${id}`} aria-current={isContentsDocked && activeSection === id ? "location" : undefined} onClick={() => {
            setIsContentsDocked(true);
            setActiveSection(id);
          }}>
            {title}
          </a>
        ))}
      </nav>
      <section id="what-it-does" aria-labelledby="what-it-does-heading">
        <h2 id="what-it-does-heading">What KinkAtlas does</h2>
        <p>KinkAtlas helps you explore language that may fit your interests, dynamics, and preferred roles.</p>
        <p>You answer questions about power, activity position, sensation, service, care, roleplay, structure, and other kink themes. KinkAtlas looks for patterns across those answers and suggests vocabulary worth exploring.</p>
        <p>It does not decide what you are. Your results are a map of possibilities—not a diagnosis, compatibility test, safety certification, or consent decision.</p>
      </section>
      <section id="how-it-works" aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading">How it works</h2>
        <p>KinkAtlas uses a deterministic, rules-based assessment. Reviewed question-to-theme mappings turn answers into evidence across independent dimensions such as directing, yielding, giving or receiving activities, intensity, care, structure, and service. Roles are compared against those patterns using reviewed scoring and role evidence rules.</p>
        <p>
          <strong>Alignment</strong> describes how closely your answers resemble a role’s themes. <strong>Confidence</strong> describes how much relevant information was available. <strong>Evidence breadth</strong> is the share of a role’s themes with usable answer evidence, not match strength. These describe different things; confidence alone does not determine ranking.
        </p>
        <p>Reflection considers knowledge and attitudes separately from role alignment; it cannot establish real-world readiness. Wants &amp; boundaries remain independent of role alignment and guide activity suggestions, not the validity of an identity. Neither readiness answers nor hard limits lower role alignment or change role ranking.</p>
        <p>The suggested role set may contain fewer than five roles—or none at all. KinkAtlas does not fill empty spaces with weak matches.</p>
        <p>You always have the final say. You can add a role manually, remove a suggestion, reorder your role set, choose your own primary role, or leave the set empty. A role selected by you does not acquire an assessment score or confidence just because you chose it.</p>
      </section>
      <section id="different-questions" aria-labelledby="different-questions-heading">
        <h2 id="different-questions-heading">Different questions, separate answers</h2>
        <p>What you like, what you call yourself, what you know, what you are ready for, what your boundaries are, and what you consent to are different questions. KinkAtlas keeps them separate instead of reducing your identity to a single personality percentage.</p>
        <ul>
          <li>A role does not imply consent.</li>
          <li>An interest does not imply readiness.</li>
          <li>A boundary does not make a role less valid.</li>
          <li>Being a Bottom does not mean being submissive.</li>
          <li>Being a Top does not mean being Dominant.</li>
        </ul>
        <p>
          Activity position and negotiated authority are different dimensions. Neither a label nor an apparent match grants permission. <Link to="/philosophy">Read the consent philosophy</Link> for the principles behind these distinctions.
        </p>
      </section>
      <section id="why-it-exists" aria-labelledby="why-it-exists-heading">
        <h2 id="why-it-exists-heading">Why KinkAtlas was built</h2>
        <p>Kink vocabulary can be surprisingly difficult to navigate. There are hundreds of overlapping roles, identities, positions, dynamics, and community terms.</p>
        <p>KinkAtlas was built to treat those distinctions more carefully—especially the difference between activity position and power, curiosity and consent, identity and readiness, and interests and boundaries. It was also designed to be private by default.</p>
        <p>The goal is not to tell you who you are. It is to give you clearer language to explore that for yourself.</p>
        <p>— D.</p>
      </section>
      <section id="what-it-does-not-do" aria-labelledby="what-it-does-not-do-heading">
        <h2 id="what-it-does-not-do-heading">What it does not do</h2>
        <p>KinkAtlas does not diagnose sexuality, assign identity, or determine who someone “really is.” It cannot certify safety, determine compatibility, predict behavior, or guarantee readiness.</p>
        <p>It does not replace education, communication, or negotiation. It does not turn role labels into consent or past consent into present consent.</p>
      </section>
      <section id="privacy" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Privacy &amp; transparency</h2>
        <p>No account is required. KinkAtlas keeps assessment answers and results in browser memory for the current session, not in persistent storage. Refreshing or closing the tab clears that assessment session.</p>
        <p>Assessment data is not saved in localStorage, sessionStorage, cookies, or IndexedDB. There is no questionnaire-data backend. Copying, downloading, or sharing a result is your choice; copies you create can remain outside KinkAtlas after the session ends.</p>
        <p>When you choose to view a completed assessment, the browser sends an empty same-origin increment request. KinkAtlas stores only the aggregate number of completions—not answers, results, roles, readiness information, boundaries, negotiation preferences, or identifiers. The public total is approximate rather than a count of unique people.</p>
        <p>Generative AI does not analyze your answers or generate your results.</p>
        <p>Results come from deterministic application rules. Under the same KinkAtlas version and ruleset, the same answers produce the same results. Results may change when those rules are updated.</p>
      </section>
      <section id="definitions" aria-labelledby="definitions-heading">
        <h2 id="definitions-heading">Role-definition methodology</h2>
        <p>Role vocabulary has developed across many communities over time, and there is no single universal dictionary. The KinkAtlas role library uses reviewed descriptions to make role terms easier to understand and compare. Some terms remain available to explore manually while KinkAtlas does not yet have a reviewed description.</p>
        <p>These reviewed descriptions are starting points for reflection and conversation. They do not determine your identity, consent, readiness, compatibility, or boundaries. The same term may carry different meanings for different people, communities, and contexts; ask what it means to the person using it.</p>
      </section>
      <section id="limitations" aria-labelledby="limitations-heading">
        <h2 id="limitations-heading">Limitations</h2>
        <p>Self-report can be incomplete or uncertain. Language changes, roles overlap, and people may use the same label differently. Context matters, and a questionnaire cannot observe real-world behavior.</p>
        <p>Results are not clinical or diagnostic. KinkAtlas cannot certify safety or substitute for consent negotiation. Treat results as exploration prompts, not verdicts.</p>
      </section>
      <Link className="button primary" to="/assessment">
        Start exploring
      </Link>
    </div>
  );
}
