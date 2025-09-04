import React from 'react';
import ReactMarkdown from 'react-markdown';
import { connect } from '@dtinsight/molecule/esm/react';
import molecule from '@dtinsight/molecule';

const LEFT_PANEL_ID = 1;

const MDPreview = connect(molecule.editor, ({ groups = [] }) => {
    const mdGroup = groups.find((group: any) => group.id === LEFT_PANEL_ID) || {};
    const mdText = mdGroup?.tab?.data?.value || '';
    return (
        <div style={{ padding: 10, overflowY: 'auto', height: '100%' }}>
            <ReactMarkdown>{mdText}</ReactMarkdown>
        </div>
    );
});

export default MDPreview;
