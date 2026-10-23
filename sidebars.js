/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  aiSidebar: [
    {
      type: 'category',
      label: 'AI documentation',
      collapsible: false,
      items: ['ai/model-card', 'ai/rag-tutorial', 'ai/api-reference', 'ai/eval-rubric'],
    },
  ],
  defenseSidebar: [
    {
      type: 'category',
      label: 'Defense & aerospace',
      collapsible: false,
      items: ['defense/maintenance-procedure', 'defense/interface-control-document'],
    },
  ],
};

module.exports = sidebars;
