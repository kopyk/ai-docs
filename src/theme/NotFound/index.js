/**
 * Ejected from @docusaurus/theme-classic 3.9.2 (NotFound, marked safe to eject).
 * Changes: sentence-case title, a description, and noindex so the 404 page
 * never shows up in search results. The page body is in ./Content.
 */
import React from 'react';
import Head from '@docusaurus/Head';
import {PageMetadata} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import NotFoundContent from '@theme/NotFound/Content';

export default function Index() {
  return (
    <>
      <PageMetadata
        title="Page not found"
        description="This page doesn't exist. Browse Jordan Yan's AI and defense documentation samples, or search them."
      />
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <Layout>
        <NotFoundContent />
      </Layout>
    </>
  );
}
