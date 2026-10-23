/**
 * Wraps @theme/DocSidebar/Desktop/CollapseButton (Docusaurus 3.9.2).
 *
 * Why: collapsing the sidebar unmounts this button while it has focus, so
 * focus falls to <body>. The wrapper records the user's collapse, and the
 * "Expand sidebar" button (src/theme/DocRoot/Layout/Sidebar/ExpandButton)
 * takes focus when it appears, and only then. Look and markup are unchanged.
 */
import React from 'react';
import CollapseButton from '@theme-original/DocSidebar/Desktop/CollapseButton';
import {requestExpandFocus} from '@site/src/theme/DocRoot/Layout/Sidebar/ExpandButton/focusIntent';

export default function CollapseButtonWrapper(props) {
  function onClick(event) {
    requestExpandFocus();
    props.onClick?.(event);
  }
  return <CollapseButton {...props} onClick={onClick} />;
}
