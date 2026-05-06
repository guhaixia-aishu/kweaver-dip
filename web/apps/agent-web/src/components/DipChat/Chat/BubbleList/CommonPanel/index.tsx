import styles from './index.module.less';
import { useDipChatStore } from '@/components/DipChat/store';
import PanelFooter from '@/components/DipChat/Chat/BubbleList/PanelFooter';
import classNames from 'classnames';
import SqlToolPanel from './SqlToolPanel';
import ChartToolPanel from './ChartToolPanel';
import CodeToolPanel from './CodeToolPanel';
import NGQLToolPanel from './NGQLToolPanel';
import Markdown from '@/components/Markdown';
import { Collapse, Skeleton } from 'antd';
import ShinyText from '@/components/animation/ShinyText';
import type { ChatBody, DipChatItemContentProgressType, DipChatItemContentType } from '@/components/DipChat/interface';
import DipIcon from '@/components/DipIcon';
import _ from 'lodash';
import InterruptFormPanel from './InterruptFormPanel';
import CommonToolPanel from './CommonToolPanel';
import DocQaToolPanel from './DocQaToolPanel';
import NetSearchToolPanel from './NetSearchToolPanel';
import MetricToolPanel from './MetricToolPanel';
import TodoListToolPanel from './TodoListToolPanel';
import AgentIcon from '@/components/AgentIcon';
import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import intl from 'react-intl-universal';
import LLMPanel from './LLMPanel';
import dayjs from 'dayjs';

const CommonPanel = ({ chatItemIndex, readOnly }: any) => {
  const {
    dipChatStore: { chatList, streamGenerating, agentDetails },
    openSideBar,
    sendChat,
  } = useDipChatStore();
  const chatItem = chatList[chatItemIndex];
  const { generating, interrupt, cancel } = chatItem;
  const content: DipChatItemContentType = chatItem.content || { progress: [], cites: {}, related_queries: [] };
  const visibleProgressItems = useMemo(
    () =>
      (content.progress ?? [])
        .map((item, progressIndex) => ({
          item,
          progressIndex,
        }))
        .filter(({ item }) => !item.hiddenInMainPanel),
    [content.progress]
  );
  const historyProgressItems = useMemo(() => visibleProgressItems.slice(0, -1), [visibleProgressItems]);
  const currentProgressItem = visibleProgressItems[visibleProgressItems.length - 1];
  const skeletonLoading = !visibleProgressItems.length && streamGenerating && chatItemIndex === chatList.length - 1;

  const renderFooter = () => {
    if (!generating && !readOnly) {
      return <PanelFooter className="dip-mt-8" chatItemIndex={chatItemIndex} />;
    }
  };
  const renderStopGenerate = () => {
    if (chatItem.cancel) {
      return (
        <div
          className={classNames(' dip-mt-16', {
            'dip-text-color-45': true,
          })}
        >
          {intl.get('dipChat.stoppedOutput')}
        </div>
      );
    }
  };

  const renderDeepThink = (thinkText: string, loading: boolean) => {
    if (thinkText) {
      return (
        <div className="dip-mb-12">
          <Collapse
            expandIconPosition="end"
            defaultActiveKey={['1']}
            ghost
            items={[
              {
                key: '1',
                label: (
                  <div className="dip-flex-align-center">
                    <DipIcon className="dip-text-color-45" type="icon-dip-think" />
                    <ShinyText
                      loading={loading ?? false}
                      className="dip-ml-8"
                      text={loading ? intl.get('dipChat.thinking') : intl.get('dipChat.deepThinking')}
                    />
                  </div>
                ),
                children: (
                  <div>
                    <Markdown className={styles.deepThinkMarkdown} value={thinkText ?? ''} readOnly />
                  </div>
                ),
              },
            ]}
          />
        </div>
      );
    }
  };

  const renderCites = () => {
    const cites = content?.cites;
    if (!_.isEmpty(cites)) {
      let total: number = 0;
      cites.forEach((item: any) => {
        if (item.children && Array.isArray(item.children)) {
          total += item.children.length;
        }
      });
      const loading = streamGenerating && chatItemIndex === chatList.length - 1;
      return (
        <div
          onClick={() => {
            if (total > 0 && !readOnly) {
              openSideBar(chatItemIndex);
            }
          }}
          className={classNames(styles.title, 'dip-mb-16 dip-flex-align-center dip-flex-item-full-width')}
        >
          <DipIcon className="dip-font-16" type="icon-dip-net" />
          <ShinyText
            loading={loading}
            className="dip-ml-8 dip-flex-item-full-width dip-ellipsis"
            text={
              loading
                ? intl.get('dipChat.readingDocs', { count: total })
                : intl.get('dipChat.foundDocs', { count: total })
            }
          />
        </div>
      );
    }
  };

  const renderIcon = () => {
    return (
      <AgentIcon
        avatar_type={agentDetails.avatar_type}
        avatar={agentDetails.avatar}
        size={30}
        name={agentDetails.name}
      />
    );
  };

  const renderInterrupt = () => {
    if (!_.isEmpty(interrupt) && interrupt.data && chatItemIndex === chatList.length - 1 && !cancel) {
      return (
        <div className="dip-mt-16">
          <InterruptFormPanel chatItemIndex={chatItemIndex} />
        </div>
      );
    }
  };

  const renderProgressItem = (item: DipChatItemContentProgressType, progressIndex: number) => {
    switch (item.type) {
      case 'metric_tool':
        return (
          <MetricToolPanel
            key={progressIndex}
            chatItemIndex={chatItemIndex}
            progressIndex={progressIndex}
            progressItem={item}
            readOnly={readOnly}
          />
        );
      case 'sql_tool':
        return (
          <SqlToolPanel
            key={progressIndex}
            chatItemIndex={chatItemIndex}
            progressIndex={progressIndex}
            progressItem={item}
            readOnly={readOnly}
          />
        );
      case 'chart_tool':
        return (
          <ChartToolPanel
            key={progressIndex}
            chatItemIndex={chatItemIndex}
            progressIndex={progressIndex}
            progressItem={item}
            readOnly={readOnly}
          />
        );
      case 'code_tool':
        return (
          <CodeToolPanel
            key={progressIndex}
            chatItemIndex={chatItemIndex}
            progressIndex={progressIndex}
            progressItem={item}
            readOnly={readOnly}
          />
        );
      case 'ngql_tool':
        return (
          <NGQLToolPanel
            key={progressIndex}
            chatItemIndex={chatItemIndex}
            progressIndex={progressIndex}
            progressItem={item}
            readOnly={readOnly}
          />
        );
      case 'docQa_tool':
        return (
          <DocQaToolPanel
            key={progressIndex}
            chatItemIndex={chatItemIndex}
            progressIndex={progressIndex}
            progressItem={item}
            readOnly={readOnly}
          />
        );
      case 'common_tool':
        return (
          <CommonToolPanel
            key={progressIndex}
            chatItemIndex={chatItemIndex}
            progressIndex={progressIndex}
            progressItem={item}
            readOnly={readOnly}
          />
        );
      case 'task_manager_tool':
      case 'todo_list_tool':
        return (
          <TodoListToolPanel
            key={progressIndex}
            progressItem={item}
            chatItemIndex={chatItemIndex}
            readOnly={readOnly}
          />
        );
      case 'net_search_tool':
        return (
          <NetSearchToolPanel
            key={progressIndex}
            chatItemIndex={chatItemIndex}
            progressIndex={progressIndex}
            progressItem={item}
            readOnly={readOnly}
          />
        );
      default: {
        const loading = streamGenerating && chatItemIndex === chatList.length - 1 && !item.llmResult?.text;
        const { netSearchResult } =
          content.progress.find(
            progressItem =>
              progressItem.type === 'net_search_tool' && progressItem.skillInfo?.name === 'online_search_cite_tool'
          ) || {};
        return (
          <div key={progressIndex}>
            {renderDeepThink(item.llmResult?.thinking || '', loading)}
            <LLMPanel
              isLLMProcess={!item.llmResult?.thinking && !item.llmResult?.text}
              status={item.status}
              text={item.llmResult?.text}
              cites={netSearchResult?.cites ?? []}
              consumeTime={item.consumeTime}
            />
          </div>
        );
      }
    }
  };

  const renderContent = () => {
    if (skeletonLoading) {
      return (
        <div>
          <div className="dip-flex-align-center">
            {renderIcon()}
            <ShinyText
              loading={streamGenerating && chatItemIndex === chatList.length - 1}
              className="dip-ml-8"
              text={intl.get('dipChat.generating')}
            />
          </div>
          <div className="dip-pl-20">
            <Skeleton className="dip-mt-16" loading={skeletonLoading} active>
              <Markdown value={''} readOnly />
            </Skeleton>
          </div>
        </div>
      );
    }

    /** 渲染相关问题 */
    const renderRelatedQueries = () => {
      if (!skeletonLoading && !readOnly && content?.related_queries && chatItemIndex === chatList.length - 1) {
        return (
          <div className="dip-mt-16">
            {content?.related_queries.map((item: string, index: number) => (
              <div
                key={index}
                title={item}
                className={classNames(styles.relatedQueries, 'dip-ellipsis dip-flex-align-center')}
                onClick={() => {
                  const cloneChatList = _.cloneDeep(chatList);
                  cloneChatList.push({
                    key: nanoid(),
                    role: 'user',
                    content: item,
                    loading: false,
                    updateTime: dayjs().valueOf(),
                  });
                  cloneChatList.push({
                    key: nanoid(),
                    role: 'common',
                    content: '',
                    loading: true,
                  });
                  const body: ChatBody = { query: item };
                  sendChat({
                    chatList: cloneChatList,
                    body,
                    activeChatItemIndex: -1,
                  });
                }}
              >
                {item}
              </div>
            ))}
          </div>
        );
      }
    };

    return (
      <div className="dip-flex">
        {renderIcon()}
        <div className={classNames('dip-ml-16 dip-flex-item-full-width')}>
          {renderCites()}
          {historyProgressItems.length > 0 && (
            <div className="dip-mb-8">
              {historyProgressItems.map(({ item, progressIndex }, historyIndex: number) => (
                <div
                  key={`history-progress-item-${progressIndex}`}
                  className={classNames({ 'dip-mb-8': historyIndex !== historyProgressItems.length - 1 })}
                >
                  {renderProgressItem(item, progressIndex)}
                </div>
              ))}
            </div>
          )}
          {currentProgressItem ? renderProgressItem(currentProgressItem.item, currentProgressItem.progressIndex) : null}
          {renderInterrupt()}
          {renderStopGenerate()}
          {renderFooter()}
          {renderRelatedQueries()}
        </div>
      </div>
    );
  };
  return <div className={styles.container}>{renderContent()}</div>;
};

export default CommonPanel;
