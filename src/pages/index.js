import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '../components/HomepageFeatures';
import { useAuth } from '../contexts/AuthContext';



function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { isAuthenticated, loading } = useAuth();
  const history = useHistory();
  const baseUrl = siteConfig.baseUrl || '/';

  const handleStartReading = (e) => {
    if (loading) {
      e.preventDefault();
      return;
    }

    if (!isAuthenticated) {
      e.preventDefault();
      // Redirect to signup with return URL
      history.push(`${baseUrl}signup?redirect=${encodeURIComponent(baseUrl + 'docs')}`);
    }
    // If authenticated, the Link will work normally
  };

  return (
    <header className={clsx('hero hero--primary', 'index-hero-banner')}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className="index-buttons">
          <Link
            className="button button--secondary button--lg"
            to="/docs"
            onClick={handleStartReading}>
            {loading ? 'Loading...' : 'Start Reading 🚀'}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Home | ${siteConfig.title}`}
      description="A comprehensive guide to Physical AI & Humanoid Robotics covering foundational concepts, ROS 2, simulation, humanoid mechanics, and human-robot interaction.">
      <HomepageHeader />
      <main>
        <section className={clsx('container', 'index-intro-section')}>
          <div className="row">
            <div className="col col--12 text--center">
                        <p className="hero__subtitle">
                          This textbook explores Physical AI & Humanoid Robotics, from foundational concepts to advanced topics like ROS 2, Isaac Sim, and LLMs.
                        </p>            </div>
          </div>
        </section>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}