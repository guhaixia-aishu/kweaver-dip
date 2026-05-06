import { useEffect, useMemo, useState } from 'react';
import { Collapse } from 'antd';
import { CheckOutlined, CloseOutlined, UpOutlined, LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import type {
  DipChatItemContentProgressType,
  TodoListResultType,
  TodoRunningProcessBlockType,
  TodoRunningProcessItemType,
} from '@/components/DipChat/interface';
import { useDipChatStore } from '@/components/DipChat/store';
import ToolIcon from '@/assets/icons/toolIcon.svg';
import AgentImg from '@/assets/icons/agent3.svg';
import MCPIcon from '@/assets/icons/mcp.svg';
import DipIcon from '@/components/DipIcon';
import Markdown from '@/components/Markdown';
import SkillBar from '@/components/DipChat/components/SkillBar';
import intl from 'react-intl-universal';
import styles from './index.module.less';

type TodoTask = {
  id: number | string;
  title?: string;
  task: string;
  blockedBy: Array<number | string>;
  status: string;
};

type TodoListToolPanelProps = {
  progressItem: DipChatItemContentProgressType;
  chatItemIndex: number;
  readOnly: boolean;
};

const getTaskUiState = (
  task: TodoTask,
  activeTaskIds: Set<number | string>,
  completedTaskIds: Set<number | string>,
  blockedTaskIds: Set<number | string>
) => {
  if (completedTaskIds.has(task.id) || task.status === 'completed') {
    return 'completed';
  }
  if (activeTaskIds.has(task.id)) {
    return 'active';
  }
  if (task.status === 'failed') {
    return 'failed';
  }
  if (blockedTaskIds.has(task.id)) {
    return 'pending';
  }
  if (task.status === 'running') {
    return 'active';
  }
  return 'pending';
};

const getDefaultActiveKeys = (shouldAutoCollapse?: boolean, showRunningProcess?: boolean) => {
  const keys: string[] = [];

  if (!shouldAutoCollapse) {
    keys.push('todo-list');
  }

  if (showRunningProcess && !shouldAutoCollapse) {
    keys.push('running-process');
  }

  return keys;
};

const TodoListToolPanel = ({ progressItem, chatItemIndex, readOnly }: TodoListToolPanelProps) => {
  const {
    dipChatStore: { activeProgressIndex, chatList, streamGenerating },
    openSideBar,
    setDipChatStore,
  } = useDipChatStore();
  const chatItem = chatList[chatItemIndex];
  const todoListResult = ((progressItem as any).todoListResult ?? {}) as TodoListResultType;

  const tasks = useMemo(
    () => (Array.isArray(todoListResult.tasks) ? todoListResult.tasks.filter(task => task?.task) : []),
    [todoListResult.tasks]
  );

  const { completedTaskIds, activeTaskIds, blockedTaskIds } = useMemo(() => {
    const completedIds = new Set<number | string>([
      ...(todoListResult.completedTaskIds ?? []),
      ...tasks.filter(task => task.status === 'completed').map(task => task.id),
    ]);
    const runnableIds = new Set<number | string>(todoListResult.runnableTaskIds ?? []);
    const blockedIds = new Set<number | string>(todoListResult.blockedTaskIds ?? []);

    return {
      completedTaskIds: completedIds,
      activeTaskIds: runnableIds,
      blockedTaskIds: blockedIds,
    };
  }, [tasks, todoListResult.blockedTaskIds, todoListResult.completedTaskIds, todoListResult.runnableTaskIds]);

  const runningProcesses = useMemo(
    () =>
      (Array.isArray(todoListResult.runningProcesses) ? todoListResult.runningProcesses : []).filter(
        (processItem): processItem is TodoRunningProcessItemType =>
          Boolean(processItem?.taskId) &&
          Array.isArray(processItem?.blocks) &&
          processItem.blocks.some(block =>
            block?.type === 'llm' ? Boolean(block.content?.trim()) : block?.type === 'skill'
          )
      ),
    [todoListResult.runningProcesses]
  );
  const taskMap = useMemo(
    () =>
      new Map(
        tasks.map(task => [String(task.id), task] as const)
      ),
    [tasks]
  );
  const taskManagerCompleted = Boolean(todoListResult.taskManagerCompleted);
  const showRunningProcess = runningProcesses.length > 0;
  const conversationEnded = Boolean(chatItem) && !streamGenerating && !chatItem.loading && !chatItem.generating;
  const shouldAutoCollapse = taskManagerCompleted || conversationEnded;
  const [activeKeys, setActiveKeys] = useState<string[]>(() =>
    getDefaultActiveKeys(shouldAutoCollapse, showRunningProcess)
  );
  const [hasManualTodoListToggle, setHasManualTodoListToggle] = useState(false);
  const [hasManualRunningProcessToggle, setHasManualRunningProcessToggle] = useState(false);

  useEffect(() => {
    setActiveKeys(prevActiveKeys => {
      const nextActiveKeys = new Set(
        prevActiveKeys.filter(key => key === 'todo-list' || (key === 'running-process' && showRunningProcess))
      );

      if (!hasManualTodoListToggle) {
        if (shouldAutoCollapse) {
          nextActiveKeys.delete('todo-list');
        } else {
          nextActiveKeys.add('todo-list');
        }
      }

      if (!hasManualRunningProcessToggle) {
        if (showRunningProcess && !shouldAutoCollapse) {
          nextActiveKeys.add('running-process');
        } else {
          nextActiveKeys.delete('running-process');
        }
      }

      return Array.from(nextActiveKeys);
    });
  }, [hasManualRunningProcessToggle, hasManualTodoListToggle, showRunningProcess, shouldAutoCollapse]);

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

  const renderRunningProcessSkillIcon = (skillInfo: any) => {
    if (!skillInfo) {
      return <ToolIcon style={{ width: '16px', height: '16px' }} />;
    }
    if (skillInfo.name === 'graph_qa') {
      return <DipIcon type="icon-dip-color-graph" className="dip-font-16" />;
    }
    if (skillInfo.type === 'AGENT') {
      return <AgentImg style={{ width: '16px', height: '16px' }} />;
    }
    if (skillInfo.type === 'MCP') {
      return <MCPIcon style={{ width: '16px', height: '16px' }} />;
    }
    return <ToolIcon style={{ width: '16px', height: '16px' }} />;
  };

  const renderRunningProcessBlock = (block: TodoRunningProcessBlockType) => {
    if (block.type === 'llm') {
      return <Markdown readOnly className={styles.processMarkdown} value={block.content} />;
    }

    const loading = block.status === 'processing' && streamGenerating && chatItemIndex === chatList.length - 1;
    const progressIndex = block.progressIndex;

    return (
      <div className={styles.processSkillBar}>
        <SkillBar
          icon={renderRunningProcessSkillIcon(block.skillInfo)}
          title={block.title}
          status={block.status}
          readOnly={readOnly}
          loading={loading}
          consumeTime={block.consumeTime}
          className={styles.processSkillCard}
          active={typeof progressIndex === 'number' && progressIndex === activeProgressIndex}
          onView={
            typeof progressIndex === 'number'
              ? () => {
                  openSideBar(chatItemIndex);
                  setDipChatStore({
                    activeProgressIndex: progressIndex,
                  });
                }
              : undefined
          }
        />
      </div>
    );
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
          const nextKeys = Array.isArray(keys) ? keys.map(String) : keys ? [String(keys)] : [];
          if (activeKeys.includes('todo-list') !== nextKeys.includes('todo-list')) {
            setHasManualTodoListToggle(true);
          }
          if (activeKeys.includes('running-process') !== nextKeys.includes('running-process')) {
            setHasManualRunningProcessToggle(true);
          }
          setActiveKeys(nextKeys);
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
              <div className={classNames(styles.todoContent, showRunningProcess ? 'dip-pb-0' : '')}>
                <div className={classNames(styles.todoTaskList, showRunningProcess ? styles.divider : '')}>
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
          ...(showRunningProcess
            ? [
                {
                  key: 'running-process',
                  label: (
                    <div className={styles.processHeader}>
                      <div className={styles.processHeaderMain}>
                        <span className={styles.processHeaderIcon}>
                          <DipIcon type="icon-taskplanning" style={{ fontSize: 12 }} />
                        </span>
                        <span className={styles.processHeaderTitle}>{intl.get('dipChat.runningProcess')}</span>
                      </div>
                    </div>
                  ),
                  children: (
                    <div className={classNames(styles.processSection, styles.divider)}>
                      <div className={styles.processContent}>
                        {runningProcesses.map(processItem => {
                          const relatedTask = taskMap.get(String(processItem.taskId));
                          return (
                            <div key={`process-${processItem.taskId}`} className={styles.processItem}>
                              {relatedTask ? (
                                <div className={styles.processTaskHeader}>
                                  <div className={styles.processTaskHeaderMain}>
                                    <span className={styles.processTaskBadge}>
                                      {`${intl.get('dipChat.taskLabel')}${relatedTask.id}`}
                                    </span>
                                    <span className={styles.processTaskTitle}>{relatedTask.title || relatedTask.task}</span>
                                  </div>
                                  {relatedTask.title ? (
                                    <div className={styles.processTaskDescription}>{relatedTask.task}</div>
                                  ) : null}
                                </div>
                              ) : null}
                              <div className={styles.processBlocks}>
                                {processItem.blocks.map(block => (
                                  <div key={block.id} className={styles.processBlock}>
                                    {renderRunningProcessBlock(block)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
};

export default TodoListToolPanel;
