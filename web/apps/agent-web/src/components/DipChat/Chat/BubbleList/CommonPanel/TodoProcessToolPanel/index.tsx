import { useMemo, useState } from 'react';
import { Collapse } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import type { DipChatItemContentProgressType } from '@/components/DipChat/interface';
import DipIcon from '@/components/DipIcon';
import Markdown from '@/components/Markdown';
import intl from 'react-intl-universal';
import styles from './index.module.less';

const TodoProcessToolPanel = ({ progressItem }: { progressItem: DipChatItemContentProgressType }) => {
  const [activeKeys, setActiveKeys] = useState<string[]>(['todo-process']);
  const output = useMemo(() => {
    const result = progressItem.todoListToolResult?.output ?? '';
    return typeof result === 'string' ? result.trim() : '';
  }, [progressItem.todoListToolResult?.output]);

  if (!output) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Collapse
        ghost
        activeKey={activeKeys}
        expandIconPosition="end"
        className={styles.collapse}
        expandIcon={({ isActive }) => (
          <UpOutlined className={styles.collapseArrow} rotate={isActive ? 0 : 180} />
        )}
        onChange={keys => {
          const nextKeys = Array.isArray(keys) ? keys.map(String) : keys ? [String(keys)] : [];
          setActiveKeys(nextKeys);
        }}
        items={[
          {
            key: 'todo-process',
            label: (
              <div className={styles.header}>
                <div className={styles.headerMain}>
                  <span className={styles.headerIcon}>
                    <DipIcon type="icon-taskplanning" style={{ fontSize: 12 }} />
                  </span>
                  <span className={styles.headerTitle}>{progressItem.title || intl.get('dipChat.runningProcess')}</span>
                </div>
              </div>
            ),
            children: (
              <div className={styles.content}>
                <Markdown className={styles.markdown} value={output} readOnly />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default TodoProcessToolPanel;
