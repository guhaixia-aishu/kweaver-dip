import { useEffect, useMemo, useState } from 'react';
import { Collapse } from 'antd';
import { CheckOutlined, CloseOutlined, LoadingOutlined, UpOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import intl from 'react-intl-universal';
import DipIcon from '@/components/DipIcon';
import { useDipChatStore } from '@/components/DipChat/store';
import type {
  DipChatItemContentProgressType,
  TodoListResultType,
  TodoListTaskType,
} from '@/components/DipChat/interface';
import styles from './index.module.less';

type TodoListToolPanelProps = {
  progressItem: DipChatItemContentProgressType;
  chatItemIndex: number;
  readOnly: boolean;
};

const getTaskUiState = (
  task: TodoListTaskType,
  activeTaskIds: Set<number | string>,
  completedTaskIds: Set<number | string>,
  blockedTaskIds: Set<number | string>
) => {
  if (completedTaskIds.has(task.id) || task.status === 'completed') {
    return 'completed';
  }
  if (activeTaskIds.has(task.id) || task.status === 'running') {
    return 'active';
  }
  if (task.status === 'failed') {
    return 'failed';
  }
  if (blockedTaskIds.has(task.id)) {
    return 'pending';
  }
  return 'pending';
};

const TodoListToolPanel = ({ progressItem, chatItemIndex }: TodoListToolPanelProps) => {
  const {
    dipChatStore: { chatList, streamGenerating },
  } = useDipChatStore();
  const chatItem = chatList[chatItemIndex];
  const todoListResult = (progressItem.todoListResult ?? {}) as TodoListResultType;
  const tasks = useMemo(
    () => (Array.isArray(todoListResult.tasks) ? todoListResult.tasks.filter(task => task?.task) : []),
    [todoListResult.tasks]
  );
  const conversationEnded = Boolean(chatItem) && !streamGenerating && !chatItem.loading && !chatItem.generating;
  const shouldAutoCollapse = Boolean(todoListResult.taskManagerCompleted) || conversationEnded;
  const [activeKeys, setActiveKeys] = useState<string[]>(() =>
    shouldAutoCollapse ? [] : ['todo-list']
  );
  const [hasManualToggle, setHasManualToggle] = useState(false);

  const { completedTaskIds, activeTaskIds, blockedTaskIds } = useMemo(() => {
    const completedIds = new Set<number | string>([
      ...(todoListResult.completedTaskIds ?? []),
      ...tasks.filter(task => task.status === 'completed').map(task => task.id),
    ]);

    return {
      completedTaskIds: completedIds,
      activeTaskIds: new Set<number | string>(todoListResult.runnableTaskIds ?? []),
      blockedTaskIds: new Set<number | string>(todoListResult.blockedTaskIds ?? []),
    };
  }, [tasks, todoListResult.blockedTaskIds, todoListResult.completedTaskIds, todoListResult.runnableTaskIds]);

  useEffect(() => {
    if (hasManualToggle) {
      return;
    }
    setActiveKeys(shouldAutoCollapse ? [] : ['todo-list']);
  }, [hasManualToggle, shouldAutoCollapse]);

  if (!tasks.length) {
    return null;
  }

  const renderTaskMarker = (state: string) => {
    if (state === 'completed') {
      return (
        <span className={classNames(styles.todoTaskMarker, styles.todoTaskMarkerCompleted)}>
          <CheckOutlined className="dip-font-8" />
        </span>
      );
    }

    if (state === 'active') {
      return (
        <span className={classNames(styles.todoTaskMarker, styles.todoTaskMarkerActive)}>
          <LoadingOutlined spin className="dip-font-16" />
        </span>
      );
    }

    if (state === 'failed') {
      return (
        <span className={classNames(styles.todoTaskMarker, styles.todoTaskMarkerFailed)}>
          <CloseOutlined className="dip-font-8" />
        </span>
      );
    }

    return <span className={classNames(styles.todoTaskMarker, styles.todoTaskMarkerPending)} />;
  };

  return (
    <div className={styles.container}>
      <Collapse
        ghost
        activeKey={activeKeys}
        expandIconPosition="end"
        className={styles.collapse}
        expandIcon={({ isActive }) => <UpOutlined className={styles.collapseArrow} rotate={isActive ? 0 : 180} />}
        onChange={keys => {
          setHasManualToggle(true);
          setActiveKeys(Array.isArray(keys) ? keys.map(String) : keys ? [String(keys)] : []);
        }}
        items={[
          {
            key: 'todo-list',
            label: (
              <div className={styles.todoHeader}>
                <div className={styles.todoHeaderMain}>
                  <span className={styles.todoHeaderIcon}>
                    <DipIcon type="icon-think" style={{ fontSize: 12 }} />
                  </span>
                  <span className={styles.todoHeaderTitle}>
                    {progressItem.title || intl.get('dipChat.taskPlanning')}
                  </span>
                </div>
              </div>
            ),
            children: (
              <div className={styles.todoContent}>
                <div className={styles.todoTaskList}>
                  {tasks.map(task => {
                    const state = getTaskUiState(task, activeTaskIds, completedTaskIds, blockedTaskIds);
                    return (
                      <div key={task.id} className={styles.todoTaskItem}>
                        {renderTaskMarker(state)}
                        <div
                          className={classNames(styles.todoTaskText, {
                            [styles.todoTaskTextCompleted]: state === 'completed',
                            [styles.todoTaskTextActive]: state === 'active',
                          })}
                        >
                          {task.title ? <div className={styles.todoTaskTitle}>{task.title}</div> : null}
                          <div className={styles.todoTaskDescription}>{task.task}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default TodoListToolPanel;
