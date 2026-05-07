import _ from 'lodash';
import { nanoid } from 'nanoid';
import type {
  ConversationItemType,
  DipChatItemContentProgressType,
  DipChatItemContentType,
  TodoRunningProcessBlockType,
  TodoRunningProcessItemType,
} from '@/components/DipChat/interface';
import type { EChartsOption } from 'echarts';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import { isJSONString } from '@/utils/handle-function';
import { removeInvalidCodeBlocks } from '@/components/Markdown/utils';
import intl from 'react-intl-universal';

/** 获取引用的数据 */
export const getCitesData = (other_variables: any) => {
  if (!_.isEmpty(other_variables)) {
    const { search_querys, search_results } = other_variables;
    if (search_querys && search_results) {
      const result = search_querys.map((title: string, titleIndex: number) => {
        const titleData = search_results[titleIndex] || [];
        return {
          id: nanoid(),
          title,
          children: titleData.filter((dataItem: any) => !!dataItem.link),
        };
      });
      return result.filter((item: any) => item.children.length > 0);
    }
  }
};

export const chartConfig2Echarts = (chartResult: any) => {
  const { chart_config, data } = chartResult || {};
  let options: EChartsOption = {};
  const chartType = _.get(chart_config, 'chart_type', '');
  // 折现图
  if (chartType === 'Line') {
    const {
      chart_config: { xField, yField, seriesField },
    } = chartResult;
    const seriesValues = Array.from(new Set(data.map((item: any) => item[seriesField])));
    const xValues: string[] = Array.from(new Set(data.map((item: any) => item[xField])));
    const series: any = seriesValues.map(seriesValue => {
      return {
        name: seriesValue,
        type: 'line',
        data: xValues.map(xValue => {
          const item = data.find((d: any) => d[xField] === xValue && d[seriesField] === seriesValue);
          return item ? item[yField] : null; // 如果没有数据则返回 null
        }),
      };
    });

    options = {
      legend: {},
      grid: {
        containLabel: true,
        top: '10%',
        bottom: '5%',
        right: '15%',
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: xValues,
        name: xField,
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        name: yField,
      },
      series: series,
    };
    const target = series.find((item: any) => item.data.length > 7);
    if (target) {
      options.dataZoom = [
        {
          type: 'slider',
          brushSelect: false,
        },
      ];
    }
  }
  // 饼图
  if (chartType === 'Pie') {
    const {
      chart_config: { colorField: rawColorField, angleField: rawAngleField, xField, yField },
    } = chartResult;
    const colorField = rawColorField || xField;
    const angleField = rawAngleField || yField;
    const pieData: any = [];
    data.forEach((item: any) => {
      pieData.push({
        name: item[colorField],
        value: Number(item[angleField]),
      });
    });
    options = {
      tooltip: {
        show: true,
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
      },
      series: [
        {
          name: angleField,
          data: pieData,
          type: 'pie',
          radius: '55%',
          center: ['40%', '50%'],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }
  // 圆环
  if (chartType === 'Circle') {
    const {
      chart_config: { colorField: rawColorField, angleField: rawAngleField, xField, yField },
    } = chartResult;
    const colorField = rawColorField || xField;
    const angleField = rawAngleField || yField;
    const pieData: any = [];
    data.forEach((item: any) => {
      pieData.push({
        name: item[colorField],
        value: Number(item[angleField]),
      });
    });
    options = {
      tooltip: {
        show: true,
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
      },
      series: [
        {
          name: angleField,
          data: pieData,
          type: 'pie',
          radius: ['40%', '55%'],
          center: ['40%', '50%'],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }
  // 柱状图
  if (chartType === 'Column') {
    const {
      chart_config: { xField, yField, seriesField },
    } = chartResult;
    const seriesValues = Array.from(new Set(data.map((item: any) => item[seriesField])));
    const xValues: string[] = Array.from(new Set(data.map((item: any) => item[xField])));
    const series: any = seriesValues.map(seriesValue => {
      return {
        name: seriesValue,
        type: 'bar',
        data: xValues.map(xValue => {
          const item = data.find((d: any) => d[xField] === xValue && d[seriesField] === seriesValue);
          return item ? item[yField] : null; // 如果没有数据则返回 null
        }),
      };
    });

    options = {
      grid: {
        containLabel: true,
        top: '15%',
        bottom: '5%',
        right: '15%',
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: xValues,
        name: xField,
        axisTick: { show: false },
        axisLabel: {
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        name: yField,
      },
      series,
    };
    // if (barData.length > 7) {
    //   options.dataZoom = [
    //     {
    //       type: 'slider',
    //       brushSelect: false,
    //     },
    //   ];
    // }
  }
  return options;
};

export const buildChartToolEchartsOptions = (chartResult: any, chartType?: string) => {
  if (_.isEmpty(chartResult)) {
    return {};
  }

  if (!chartType) {
    return chartConfig2Echarts(chartResult);
  }

  const nextChartResult = _.cloneDeep(chartResult);
  _.set(nextChartResult, ['chart_config', 'chart_type'], chartType);
  return chartConfig2Echarts(nextChartResult);
};

const getTableColumnByTableData = (tableData: any) => {
  if (tableData.length === 0) {
    return [];
  }
  let columnName: string[] = [];
  tableData.forEach((item: any) => {
    const tempArr = Object.keys(item);
    columnName = [...columnName, ...tempArr];
  });
  columnName = _.uniq(columnName);
  const columns: TableColumnsType = columnName.map(item => ({
    dataIndex: item,
    title: item,
    width: 120,
  }));
  columns.unshift({
    width: 60,
    fixed: 'left',
    dataIndex: 'index',
    title: '序号',
    render: (_text: any, _record: any, index: number) => index + 1,
  });
  return columns;
};

const ngqlData2TableData = (data: any) => {
  const tableColumns: any = [];
  const tableData: any = [];
  if (!_.isEmpty(data) && typeof data === 'object') {
    console.log(data, '哈哈哈哈');
    Object.keys(data).forEach(item => {
      if (!_.isObject(data[`${item}`][0])) {
        const key: string = item.split('.').pop()!;
        tableColumns.push({
          dataIndex: key,
          title: key,
          width: 120,
        });
        // data[item] 就是数据的数量
        data[`${item}`]?.forEach((dataItem: any, index: number) => {
          if (!tableData[index]) {
            tableData.push({
              [key]: dataItem,
            });
          } else {
            tableData[index][key] = dataItem;
          }
        });
      } else {
        data[`${item}`]?.forEach((dataItem: any) => {
          if (dataItem) {
            Object.keys(dataItem).forEach(key => {
              tableColumns.push({
                dataIndex: key,
                title: key,
                width: 120,
              });
            });
            tableData.push(dataItem);
          }
        });
      }
    });
    tableColumns.unshift({
      width: 60,
      fixed: 'left',
      dataIndex: 'index',
      title: '序号',
      render: (_text: any, _record: any, index: number) => index + 1,
    });
  }
  // console.log(tableColumns, tableData, 'tableColumns, tableData');
  return {
    tableColumns: _.uniqBy(tableColumns, 'dataIndex'),
    tableData,
  };
};

/** 处理大模型回答的markdown字符串中异常的字符*/
const filterLLMAnswerExceptionText = (markdownText: string, filterEmptyCode: boolean = false): string => {
  if (markdownText) {
    // console.log('llm-处理之前的结果');
    // console.log(markdownText);
    const result = removeInvalidCodeBlocks(markdownText, filterEmptyCode);
    // console.log('llm-处理之后的结果');
    // console.log(result);
    return result;
  }
  return '';
};

/** 将LLM中引用文本转换为i标签 */
const llmTextCiteTransform = (text: string) => {
  // 使用正则表达式匹配,规则如下
  // 1. 以中括号开头和以中括号结尾的文本
  // 2. 中括号包裹的内容使用Number要能转换为数字
  // 然后将匹配到的文本使用i标签替换中括号进行包裹
  if (!text) return '';
  return text.replace(/\[(\d+)\]/g, (_match, p1) => `<i index="${p1}" >${p1}</i>`);
};

/** 后端数据获取前端渲染需要的聊天项的content */
const normalizeTodoTaskCollection = (tasks: any) => {
  if (Array.isArray(tasks)) {
    return tasks.filter(Boolean);
  }
  if (_.isPlainObject(tasks) && !_.isEmpty(tasks)) {
    return [tasks];
  }
  return [];
};

const getTodoTaskIds = (tasks: any) =>
  normalizeTodoTaskCollection(tasks)
    .map(task => task?.id)
    .filter((id): id is number | string => typeof id === 'number' || typeof id === 'string');

const getTodoTaskStatusMap = (tasks: any) => {
  const statusMap = new Map<number | string, string>();

  normalizeTodoTaskCollection(tasks).forEach(task => {
    const taskId = task?.id;
    if ((typeof taskId === 'number' || typeof taskId === 'string') && task?.status) {
      statusMap.set(taskId, task.status);
    }
  });

  return statusMap;
};

const TODO_TASK_START_LINE_REGEXP =
  /(^|[\r\n])\s*(?:[-*+]\s+|#{1,6}\s+|>\s+)?(?:\*\*|__|\*|_|`{1,3})?\s*start_task_(\d+)\s*(?:\*\*|__|\*|_|`{1,3})?(?=\s*(?:$|[\r\n]))/i;
const TODO_TASK_END_LINE_REGEXP =
  /(^|[\r\n])\s*(?:[-*+]\s+|#{1,6}\s+|>\s+)?(?:\*\*|__|\*|_|`{1,3})?\s*end_task_(\d+)\s*(?:\*\*|__|\*|_|`{1,3})?(?=\s*(?:$|[\r\n]))/i;
const TODO_TASK_START_INLINE_REGEXP = /(?:\*\*|__|\*|_|`{1,3})?\s*\bstart_task_(\d+)\b\s*(?:\*\*|__|\*|_|`{1,3})?/i;
const TODO_TASK_END_INLINE_REGEXP = /(?:\*\*|__|\*|_|`{1,3})?\s*\bend_task_(\d+)\b\s*(?:\*\*|__|\*|_|`{1,3})?/i;

const consumeTodoTaskMarkerSuffix = (text: string, startIndex: number) => {
  let nextIndex = startIndex;
  while (nextIndex < text.length && /\s/.test(text[nextIndex])) {
    nextIndex += 1;
  }
  return nextIndex;
};

const transformLlmAnswerText = (text: string, filterEmptyCode: boolean = false) =>
  llmTextCiteTransform(filterLLMAnswerExceptionText(text, filterEmptyCode));

const extractTodoTaskMarker = (
  text: string,
  markerType: 'start' | 'end',
  expectedTaskId?: number | string | null
) => {
  if (!text) {
    return null;
  }

  const lineRegexp = markerType === 'start' ? TODO_TASK_START_LINE_REGEXP : TODO_TASK_END_LINE_REGEXP;
  const inlineRegexp = markerType === 'start' ? TODO_TASK_START_INLINE_REGEXP : TODO_TASK_END_INLINE_REGEXP;
  const buildMarker = (matched: RegExpExecArray, offset: number) => {
    const taskId = matched[2] || matched[1];
    if (!taskId) {
      return null;
    }
    if (expectedTaskId !== undefined && expectedTaskId !== null && String(taskId) !== String(expectedTaskId)) {
      return null;
    }

    const baseIndex = (matched.index ?? 0) + offset;
    const markerStartIndex = matched[2] && typeof matched.index === 'number' ? baseIndex + (matched[1]?.length || 0) : baseIndex;
    const contentStartIndex = consumeTodoTaskMarkerSuffix(text, baseIndex + matched[0].length);

    return {
      taskId,
      markerStartIndex,
      contentStartIndex,
    };
  };

  const regexpList = [lineRegexp, inlineRegexp];
  let earliestMarker: { taskId: string; markerStartIndex: number; contentStartIndex: number } | null = null;

  regexpList.forEach(regexp => {
    let offset = 0;
    let remainingText = text;

    while (remainingText) {
      const matched = regexp.exec(remainingText);
      if (!matched) {
        break;
      }

      const marker = buildMarker(matched, offset);
      if (marker) {
        if (!earliestMarker || marker.markerStartIndex < earliestMarker.markerStartIndex) {
          earliestMarker = marker;
        }
        break;
      }

      const nextOffset = (matched.index ?? 0) + matched[0].length;
      if (nextOffset <= 0) {
        break;
      }
      offset += nextOffset;
      remainingText = remainingText.slice(nextOffset);
    }
  });

  return earliestMarker;
};

const processLlmAnswerWithTodoTaskMarkers = (
  progressItems: DipChatItemContentProgressType[],
  llmAnswer: string,
  progressStatus: 'processing' | 'completed' | 'failed',
  thinking: string,
  consumeTime: string,
  consumeTokens: number,
  activeTaskId: number | string | null
) => {
  let remainingText = llmAnswer || '';
  let currentActiveTaskId = activeTaskId;
  let normalContent = '';
  let handledMarker = false;

  const appendNormalContent = (text: string) => {
    if (!text) {
      return;
    }
    normalContent += text;
  };

  while (remainingText) {
    if (currentActiveTaskId !== null) {
      const endTaskMarker = extractTodoTaskMarker(remainingText, 'end', currentActiveTaskId);
      const runningProcessText = endTaskMarker
        ? remainingText.slice(0, endTaskMarker.markerStartIndex)
        : remainingText;

      if (
        !updateTodoRunningProcess(
          progressItems,
          currentActiveTaskId,
          transformLlmAnswerText(runningProcessText, progressStatus === 'completed'),
          { completed: Boolean(endTaskMarker) }
        )
      ) {
        return false;
      }

      handledMarker = true;
      if (!endTaskMarker) {
        remainingText = '';
        break;
      }

      currentActiveTaskId = null;
      remainingText = remainingText.slice(endTaskMarker.contentStartIndex);
      continue;
    }

    const startTaskMarker = extractTodoTaskMarker(remainingText, 'start');
    if (!startTaskMarker) {
      appendNormalContent(remainingText);
      remainingText = '';
      break;
    }

    if (!getLatestTodoListProgressItem(progressItems)) {
      return false;
    }

    appendNormalContent(remainingText.slice(0, startTaskMarker.markerStartIndex));
    handledMarker = true;
    currentActiveTaskId = startTaskMarker.taskId;
      remainingText = remainingText.slice(startTaskMarker.contentStartIndex);
  }

  if (!handledMarker) {
    return false;
  }

  pushLlmProgressItem(
    progressItems,
    progressStatus,
    transformLlmAnswerText(normalContent, progressStatus === 'completed'),
    thinking,
    consumeTime,
    consumeTokens
  );

  return {
    handledMarker,
    activeTaskId: currentActiveTaskId,
  };
};

const mergeTodoRunningProcessContent = (
  currentContent: string = '',
  nextContent: string = '',
  replace: boolean = false
) => {
  const normalizedCurrentContent = currentContent.trim();
  const normalizedNextContent = nextContent.trim();

  if (!normalizedNextContent) {
    return normalizedCurrentContent;
  }

  if (replace || !normalizedCurrentContent) {
    return normalizedNextContent;
  }

  return `${normalizedCurrentContent}\n\n${normalizedNextContent}`;
};

const getNormalizedTodoRunningProcessBlocks = (processItem: any): TodoRunningProcessBlockType[] => {
  if (Array.isArray(processItem?.blocks)) {
    return processItem.blocks.filter(Boolean);
  }

  if (typeof processItem?.content === 'string' && processItem.content.trim()) {
    return [
      {
        id: nanoid(),
        type: 'llm',
        content: processItem.content.trim(),
      },
    ];
  }

  return [];
};

const appendTodoRunningProcessLlmBlock = (
  currentBlocks: TodoRunningProcessBlockType[] = [],
  nextContent: string,
  replace: boolean = false
) => {
  const normalizedNextContent = nextContent.trim();
  if (!normalizedNextContent) {
    return currentBlocks;
  }

  const nextBlocks = [...currentBlocks];
  const lastBlock = nextBlocks[nextBlocks.length - 1];

  if (replace && lastBlock?.type === 'llm') {
    lastBlock.content = normalizedNextContent;
    return nextBlocks;
  }

  if (lastBlock?.type === 'llm') {
    lastBlock.content = mergeTodoRunningProcessContent(lastBlock.content, normalizedNextContent, false);
    return nextBlocks;
  }

  nextBlocks.push({
    id: nanoid(),
    type: 'llm',
    content: normalizedNextContent,
  });

  return nextBlocks;
};

const pushLlmProgressItem = (
  progressItems: DipChatItemContentProgressType[],
  progressStatus: 'processing' | 'completed' | 'failed',
  llmAnswerText: string,
  thinking: string,
  consumeTime: string,
  consumeTokens: number
) => {
  if (!llmAnswerText?.trim()) {
    return;
  }

  progressItems.push({
    status: progressStatus,
    type: 'llm',
    llmResult: {
      text: llmAnswerText,
      thinking,
    },
    consumeTime,
    consumeTokens,
  });
};

const appendLastProgressItemToTodoRunningProcess = (
  progressItems: DipChatItemContentProgressType[],
  taskId: number | string
) => {
  const lastProgressItem = progressItems[progressItems.length - 1];
  if (!lastProgressItem || lastProgressItem.type === 'llm' || !lastProgressItem.skillInfo) {
    return false;
  }

  return updateTodoRunningProcess(progressItems, taskId, '', {
    blockType: 'skill',
    skillBlock: {
      id: nanoid(),
      type: 'skill',
      title: lastProgressItem.title,
      status: lastProgressItem.status,
      consumeTime: lastProgressItem.consumeTime,
      skillInfo: lastProgressItem.skillInfo,
      progressIndex: progressItems.length - 1,
    },
  });
};

const getTodoListResult = (result: any) => {
  const tasks = Array.isArray(result?.tasks)
    ? result.tasks
        .filter((task: any) => task && task.task)
        .map((task: any) => ({
          id: task.id ?? nanoid(),
          title: task.title,
          task: task.task,
          blockedBy: Array.isArray(task.blockedBy) ? task.blockedBy : [],
          status: task.status ?? 'pending',
        }))
    : [];

  return {
    sessionId: result?.session_id,
    status: result?.status,
    tasks,
    runnableTaskIds: getTodoTaskIds(result?.runnable_tasks),
    completedTaskIds: getTodoTaskIds(result?.completed_tasks),
    blockedTaskIds: getTodoTaskIds(result?.blocked_tasks),
    blockedTaskStatusMap: getTodoTaskStatusMap(result?.blocked_tasks),
  };
};

const getInitialTodoTasks = (tasks: any[] = []) =>
  tasks.map(task => ({
    ...task,
    status: 'pending',
  }));
const getLatestTodoListProgressItem = (progressItems: DipChatItemContentProgressType[]) => {
  const matchedIndex = _.findLastIndex(progressItems, item => item.type === 'todo_list_tool');
  if (matchedIndex === -1) {
    return null;
  }
  return {
    matchedIndex,
    item: progressItems[matchedIndex] as DipChatItemContentProgressType,
  };
};

const updateTodoRunningProcess = (
  progressItems: DipChatItemContentProgressType[],
  taskId: number | string,
  content: string,
  options: {
    completed?: boolean;
    replace?: boolean;
    blockType?: 'llm' | 'skill';
    skillBlock?: TodoRunningProcessBlockType;
  } = {}
) => {
  const matchedTodoListProgress = getLatestTodoListProgressItem(progressItems);

  if (!matchedTodoListProgress) {
    return false;
  }

  const { matchedIndex } = matchedTodoListProgress;
  const currentItem: any = matchedTodoListProgress.item;
  const runningProcesses = Array.isArray(currentItem.todoListResult?.runningProcesses)
    ? [...currentItem.todoListResult.runningProcesses]
    : [];
  const processIndex = runningProcesses.findIndex(processItem => String(processItem?.taskId) === String(taskId));
  const currentProcessItem = processIndex > -1 ? runningProcesses[processIndex] : null;
  const currentBlocks = getNormalizedTodoRunningProcessBlocks(currentProcessItem);
  let nextBlocks = currentBlocks;

  if (options.blockType === 'skill') {
    if (options.skillBlock) {
      nextBlocks = [...currentBlocks, options.skillBlock];
    }
  } else {
    nextBlocks = appendTodoRunningProcessLlmBlock(currentBlocks, content, options.replace);
  }

  const nextProcessItem: TodoRunningProcessItemType = {
    taskId,
    blocks: nextBlocks,
    completed: options.completed ?? currentProcessItem?.completed ?? false,
  };

  if (processIndex > -1) {
    runningProcesses[processIndex] = nextProcessItem;
  } else if (nextProcessItem.blocks.length) {
    runningProcesses.push(nextProcessItem);
  }

  progressItems[matchedIndex] = {
    ...currentItem,
    todoListResult: {
      ...currentItem.todoListResult,
      runningProcesses,
    },
  } as DipChatItemContentProgressType;

  return true;
};

const mergeTodoTasks = (
  currentTasks: any[] = [],
  nextTasks: any[] = [],
  updateSource: 'todo_list_tool' | 'task_manager_tool',
  runnableTaskIds: Array<number | string> = [],
  blockedTaskStatusMap: Map<number | string, string> = new Map()
) => {
  if (!nextTasks.length) {
    return currentTasks;
  }

  const maxLength = Math.max(currentTasks.length, nextTasks.length);
  const runnableTaskIdSet = new Set(runnableTaskIds);

  return Array.from({ length: maxLength }, (_, index) => {
    const currentTask = currentTasks[index];
    const nextTask = nextTasks[index];

    if (!nextTask) {
      return currentTask;
    }

    const mergedTask = {
      ...currentTask,
      ...nextTask,
    };

    if (nextTask.status && nextTask.status !== 'pending') {
      mergedTask.status = nextTask.status;
    } else if (updateSource === 'task_manager_tool') {
      if (runnableTaskIdSet.has(mergedTask.id)) {
        mergedTask.status = 'running';
      } else if (blockedTaskStatusMap.get(mergedTask.id) === 'failed') {
        mergedTask.status = 'failed';
      } else {
        mergedTask.status = 'pending';
      }
    } else {
      mergedTask.status = currentTask?.status ?? nextTask.status ?? 'pending';
    }

    return mergedTask;
  }).filter(Boolean);
};

const updateTodoProgressItem = (
  progressItems: DipChatItemContentProgressType[],
  todoListResult: ReturnType<typeof getTodoListResult>,
  commonSkillRes: Record<string, any>,
  updateSource: 'todo_list_tool' | 'task_manager_tool'
) => {
  const matchedTodoListProgress = getLatestTodoListProgressItem(progressItems);

  if (!matchedTodoListProgress) {
    return false;
  }

  const { matchedIndex } = matchedTodoListProgress;
  const currentItem: any = matchedTodoListProgress.item;
  const currentTasks = currentItem.todoListResult?.tasks || [];
  const mergedTasks = mergeTodoTasks(
    currentTasks,
    todoListResult.tasks || [],
    updateSource,
    todoListResult.runnableTaskIds || [],
    todoListResult.blockedTaskStatusMap || new Map()
  );
  const nextItem = {
    ...currentItem,
    ...commonSkillRes,
    hiddenInMainPanel: false,
    title: currentItem.title || intl.get('dipChat.taskPlanning'),
    todoListResult: {
      ...currentItem.todoListResult,
      ...todoListResult,
      hasTaskManagerUpdate: currentItem.todoListResult?.hasTaskManagerUpdate || updateSource === 'task_manager_tool',
      taskManagerCompleted:
        currentItem.todoListResult?.taskManagerCompleted ||
        (updateSource === 'task_manager_tool' && todoListResult.status === 'completed'),
      tasks: mergedTasks,
    },
  } as DipChatItemContentProgressType;

  const shouldMoveToCurrentPosition =
    updateSource === 'todo_list_tool' && !currentTasks.length && mergedTasks.length > 0;

  if (shouldMoveToCurrentPosition) {
    progressItems.splice(matchedIndex, 1);
    progressItems.push(nextItem);
  } else {
    progressItems[matchedIndex] = nextItem;
  }

  return true;
};
export const getChatItemContent = (message: any): DipChatItemContentType => {
  const { content } = message || {};
  let ext: any;
  if (typeof message.ext === 'string') {
    ext = isJSONString(message.ext) ? JSON.parse(message.ext) : {};
  } else {
    ext = message.ext;
  }
  const res: DipChatItemContentProgressType[] = [];
  let activeTodoRunningTaskId: number | string | null = null;
  let cites = [];
  if (!_.isEmpty(content)) {
    // 获取数据范围
    const other_variables = _.get(content, ['middle_answer', 'other_variables']);
    if (!_.isEmpty(other_variables)) {
      cites = getCitesData(other_variables);
    }
    // 获取过程数据
    const progress = _.get(content, ['middle_answer', 'progress'], []).filter((item: any) => !!item);
    if (Array.isArray(progress) && progress.length > 0) {
      for (let i = 0; i < progress.length; i++) {
        const progressItem = progress[i];
        const { stage, status, flags, end_time, start_time, token_usage } = progressItem || {};
        if (flags) {
          const flagsObj = isJSONString(flags) ? JSON.parse(flags) : flags;
          if (_.get(flagsObj, 'debug')) {
            continue;
          }
        }
        // 说明是大模型的回答，只取最终结果
        if (stage === 'llm') {
          const llmAnswer = progressItem.answer || '';
          const consumeTime = (end_time - start_time).toFixed(2);
          const consumeTokens = _.get(token_usage, 'total_tokens', 0);
          const handledTodoTaskResult = processLlmAnswerWithTodoTaskMarkers(
            res,
            llmAnswer,
            status,
            progressItem.think,
            consumeTime,
            consumeTokens,
            activeTodoRunningTaskId
          );

          if (handledTodoTaskResult && typeof handledTodoTaskResult === 'object' && handledTodoTaskResult.handledMarker) {
            activeTodoRunningTaskId = handledTodoTaskResult.activeTaskId;
            continue;
          }

          res.push({
            status,
            type: 'llm',
            llmResult: {
              text: llmAnswer && transformLlmAnswerText(llmAnswer, status === 'completed'),
              thinking: progressItem.think,
            },
            consumeTime,
            consumeTokens,
            // cachedTokens: _.get(token_usage, 'prompt_token_details.cached_tokens', 0),
          });
          continue;
        }
        // 说明是工具
        if (stage === 'skill') {
          const notShowResultToolName: string[] = ['search_memory', '_date', 'build_memory']; // 根据工具名指定工具的结果不用显示
          const sandboxName = [
            'create_file',
            'read_file',
            'list_files',
            'get_status',
            'execute_command',
            'execute_code',
            'close_sandbox',
          ];
          const toolArgs = _.get(progressItem, ['skill_info', 'args']) || [];
          const skillInfo = _.get(progressItem, ['skill_info']);
          const skillName = _.get(progressItem, ['skill_info', 'name']) || '';
          const name = skillName.toLowerCase();

          const answer = _.get(progressItem, ['answer']) || {};
          const full_result = _.get(progressItem, ['answer', 'full_result']) || {};
          const result = _.get(progressItem, ['answer', 'result']) || {};
          const finalResult: any = !_.isEmpty(full_result) ? full_result : (result ?? {});

          // 工具的参数含有 action=show_ds 的时候，不显示结果
          if (toolArgs.some((item: any) => item?.name === 'action' && item?.value === 'show_ds')) {
            continue;
          }

          let defaultTitle = `${name}执行中...`;
          if (status === 'completed') {
            defaultTitle = `${name}执行完成`;
          } else if (status === 'failed') {
            defaultTitle = `${name}执行失败`;
          } else if (status === 'skipped') {
            defaultTitle = `已跳过${name}`;
          }

          const commonSkillRes: any = {
            consumeTime: (end_time - start_time).toFixed(2),
            status,
            originalAnswer: answer,
            skillInfo,
            hiddenInMainPanel: activeTodoRunningTaskId !== null,
          };
          const appendSkillToRunningProcessIfNeeded = () => {
            if (activeTodoRunningTaskId === null) {
              return;
            }
            appendLastProgressItemToTodoRunningProcess(res, activeTodoRunningTaskId);
          };
          if (name === 'task_manager_tool' || name === 'ask_manager_tool') {
            const taskManagerResult = !_.isEmpty(result) ? result : !_.isEmpty(full_result) ? full_result : answer;
            const todoListResult = getTodoListResult(taskManagerResult);
            updateTodoProgressItem(
              res,
              todoListResult,
              { ...commonSkillRes, originalAnswer: null },
              'task_manager_tool'
            );
            continue;
          }

          if (name === 'todo_list_tool') {
            const todoListResult = getTodoListResult(
              !_.isEmpty(result) ? result : !_.isEmpty(full_result) ? full_result : answer
            );
            if (
              !updateTodoProgressItem(
                res,
                todoListResult,
                { ...commonSkillRes, originalAnswer: null },
                'todo_list_tool'
              )
            ) {
              res.push({
                title: intl.get('dipChat.taskPlanning'),
                type: 'todo_list_tool',
                ...commonSkillRes,
                hiddenInMainPanel: false,
                originalAnswer: null,
                todoListResult: {
                  ...todoListResult,
                  hasTaskManagerUpdate: false,
                  taskManagerCompleted: false,
                  runningProcesses: [],
                  tasks: getInitialTodoTasks(todoListResult.tasks || []),
                },
              });
            }
            continue;
          }

          if (name === 'text2metric') {
            let title = defaultTitle;
            const inputArgs = toolArgs.find((arg: any) => arg?.name === 'input');
            if (inputArgs) {
              title = inputArgs.value;
            }
            const titleRes = _.get(finalResult, ['title'], '');
            if (titleRes) {
              title = titleRes;
            }
            const tableData = _.get(finalResult, ['data']) || [];
            res.push({
              title,
              type: 'metric_tool',
              metricResult: {
                input: toolArgs,
                tableData,
                tableColumns: getTableColumnByTableData(tableData),
              },
              ...commonSkillRes,
            });
            appendSkillToRunningProcessIfNeeded();
            continue;
          }
          if (name === 'text2sql' || name === 'sql_helper') {
            let title = defaultTitle;
            const inputArgs = toolArgs.find((arg: any) => arg?.name === 'input');
            if (inputArgs) {
              title = inputArgs.value;
            }
            const tableData = _.get(finalResult, ['data']) || [];
            const sql = _.get(finalResult, ['sql'], '');
            const titleRes = _.get(finalResult, ['title'], '');
            if (titleRes) {
              title = titleRes;
            }
            if (!_.isEmpty(finalResult) && !sql && status === 'completed') {
              // 工具调用完成不是约定的结构，默认没有调用此工具
              continue;
            }
            res.push({
              title,
              type: 'sql_tool',
              sqlResult: {
                tableData,
                tableColumns: getTableColumnByTableData(tableData),
                sql,
              },
              ...commonSkillRes,
            });
            appendSkillToRunningProcessIfNeeded();
            continue;
          }
          if (name === 'json2plot') {
            // 说明是图表工具，显示标题和结果
            let title = defaultTitle;
            const inputArgs = toolArgs.find((arg: any) => arg?.name === 'title');
            if (inputArgs) {
              title = inputArgs.value;
            }
            const titleRes = _.get(finalResult, ['title'], '');
            if (titleRes) {
              title = titleRes;
            }
            const tableData = _.get(finalResult, ['data']) || [];
            const echartsOptions = chartConfig2Echarts(finalResult);
            res.push({
              title,
              type: 'chart_tool',
              chartResult: {
                echartsOptions,
                tableColumns: getTableColumnByTableData(tableData),
                tableData,
                rawChartResult: {
                  chart_config: _.get(finalResult, ['chart_config'], {}),
                  data: tableData,
                  title: titleRes || title,
                },
              },
              ...commonSkillRes,
            });
            appendSkillToRunningProcessIfNeeded();
            continue;
          }
          if (sandboxName.includes(name)) {
            // 说明是代码工具，显示标题和结果
            let title = defaultTitle;
            const action = _.get(finalResult, 'action') || '';
            const actionMessage = _.get(finalResult, 'message') || '';
            const actionResult = _.get(finalResult, 'result') || {};
            if (actionMessage) {
              title = actionMessage;
            }
            const inputArgs = toolArgs.find((arg: any) => arg?.name === 'filename');
            if (inputArgs) {
              title = inputArgs.value;
            }
            const titleRes = _.get(finalResult, ['title'], '');
            if (titleRes) {
              title = titleRes;
            }
            let input = '';
            const contentArgs = toolArgs.find((arg: any) => arg?.name === 'content' || arg?.name === 'command');
            if (contentArgs) {
              input = contentArgs.value;
            }
            res.push({
              title,
              type: 'code_tool',
              codeResult: {
                input,
                actionResult,
                action,
                actionMessage,
              },
              ...commonSkillRes,
            });
            appendSkillToRunningProcessIfNeeded();
            continue;
          }
          if (name === 'text2ngql') {
            let title = defaultTitle;
            const inputArgs = toolArgs.find((arg: any) => arg?.name === 'query');
            if (inputArgs) {
              title = inputArgs.value;
            }
            const titleRes = _.get(finalResult, ['title'], '');
            if (titleRes) {
              title = titleRes;
            }
            const sql = _.get(finalResult, ['sql']);
            const data = _.get(finalResult, ['data']);
            const tableObj = ngqlData2TableData(data);
            res.push({
              title,
              type: 'ngql_tool',
              ngqlResult: {
                sql,
                tableColumns: tableObj.tableColumns as any,
                tableData: tableObj.tableData,
              },
              ...commonSkillRes,
            });
            appendSkillToRunningProcessIfNeeded();
            continue;
          }
          if (name === 'doc_qa') {
            let title = defaultTitle;
            const inputArgs = toolArgs.find((arg: any) => arg?.name === 'query');
            if (inputArgs) {
              title = inputArgs.value;
            }
            const data_source = _.get(finalResult, 'data_source.doc', []);
            const htmlText = _.get(finalResult, ['text']) || '';
            const cites = (_.get(finalResult, ['cites'], []) || []).map((item: any) => {
              let ds_id: string | undefined;
              data_source.forEach((ii: any) => {
                _.get(ii, 'fields', []).forEach((fieldItem: any) => {
                  if (item && item.doc_id && item.doc_id?.startsWith(fieldItem?.source)) {
                    ds_id = ii?.['ds_id'];
                  }
                });
              });
              return {
                ...item,
                ds_id,
              };
            });
            res.push({
              title,
              type: 'docQa_tool',
              docQaToolResult: {
                htmlText,
                cites,
              },
              ...commonSkillRes,
              originalAnswer: null,
            });
            appendSkillToRunningProcessIfNeeded();
            continue;
          }
          if (name === 'zhipu_search_tool') {
            const tool_calls = _.get(answer, 'choices[0].message.tool_calls', []);
            let search_querys: any = [];
            const search_results: any = [];
            const search_intent = tool_calls.filter((item: any) => item.type === 'search_intent');
            search_intent.forEach((item: any) => {
              const tmpArr = item.search_intent?.map((item: any) => item.query);
              search_querys = [...search_querys, ...tmpArr];
              tool_calls.forEach((ii: any) => {
                if (ii.id === item.id && ii.type === 'search_result') {
                  search_results.push(ii.search_result);
                }
              });
            });
            // console.log(search_querys, 'search_querys');
            // console.log(search_results, 'search_results');
            res.push({
              type: 'net_search_tool',
              netSearchResult: {
                cites: getCitesData({ search_querys, search_results }),
              },
              ...commonSkillRes,
              originalAnswer: null,
            });
            appendSkillToRunningProcessIfNeeded();
            continue;
          }
          if (name === 'online_search_cite_tool') {
            const cites = answer?.references ?? [];
            res.push({
              type: 'net_search_tool',
              netSearchResult: {
                // cites: cites.filter((item: any) => !!item.link),
                cites,
              },
              ...commonSkillRes,
              originalAnswer: null,
            });
            appendSkillToRunningProcessIfNeeded();
            continue;
          }
          if (!notShowResultToolName.includes(name)) {
            //  内置工具 可以做具体效果的渲染
            //  非内置工具，由于字段是动态的，无法固定取值，前端只能以JSON的形式  展示工具的结果
            // 非内置工具, JSON 展示
            let markdownText: string = '';
            if (!_.isEmpty(answer) || status === 'processing') {
              if (typeof answer === 'string') {
                markdownText = answer;
              }
              if (typeof answer === 'object') {
                // markdownText = '```json\n' + JSON.stringify(tmpResult, null, 2) + '\n```';
                markdownText = JSON.stringify(answer, null, 2);
              }
              let title = defaultTitle;
              const inputArgs = toolArgs.find((arg: any) => arg?.name === 'query' || arg?.name === 'input');
              if (inputArgs && typeof inputArgs.value !== 'object' && inputArgs.value?.toString().trim()) {
                title = inputArgs.value;
              }
              const titleRes = _.get(finalResult, ['title'], '');
              if (titleRes) {
                title = titleRes;
              }
              res.push({
                title,
                type: 'common_tool',
                commonToolResult: {
                  input: JSON.stringify(toolArgs, null, 2),
                  output: markdownText,
                },
                ...commonSkillRes,
                originalAnswer: null,
              });
              appendSkillToRunningProcessIfNeeded();
            }
          }
        }
      }
    }
  }
  return {
    progress: res,
    cites,
    related_queries: _.get(ext, 'related_queries', []),
    totalTime: ext.total_time,
    totalTokens: ext.total_tokens,
    ttftTime: ext.ttft,
  };
};

/** 从Agent身上获取临时区config */
export const getTempAreaConfigFromAgent = (agentConfig: any) => {
  return agentConfig?.input?.temp_zone_config ?? {};
};

/** 获取是否启用临时区 */
export const getTempAreaEnable = (agentConfig: any) => {
  const { tmp_file_use_type } = getTempAreaConfigFromAgent(agentConfig);
  return tmp_file_use_type === 'select_from_temp_zone';
};

/** 获取输入框是否支持文件上传 */
export const getFileUploadEnable = (agentConfig: any) => {
  const { tmp_file_use_type } = getTempAreaConfigFromAgent(agentConfig);
  return tmp_file_use_type === 'upload';
};

export const getConversationByKey = (conversationList: ConversationItemType[], key: string) => {
  for (let i = 0; i < conversationList.length; i++) {
    const item = conversationList[i];
    if (item.children) {
      for (let j = 0; j < item.children.length; j++) {
        const childItem = item.children[j];
        if (childItem.key === key) {
          return childItem;
        }
      }
    }
  }
};

// 默认倒计时 5秒
export const getDefaultCountdown = () => dayjs().valueOf() + 1000 * 5;

export const getAgentInputDisplayFields = (agentConfig: any) => {
  const buildInFields = ['history', 'tool', 'header', 'self_config', 'query'];
  const inputConfig = _.get(agentConfig, 'input.fields') || [];
  return inputConfig.filter((field: any) => !buildInFields.includes(field?.name) && field.type !== 'file');
};

/** 处理Agent配置中 文件类型 */
export const handleAgentConfigFileExt = (agentDetails: any, allFileExtData: any) => {
  const newAgentDetails = _.cloneDeep(agentDetails);
  const allowed_file_types = _.get(newAgentDetails, 'config.input.temp_zone_config.allowed_file_types');
  const allowed_file_categories = _.get(newAgentDetails, 'config.input.temp_zone_config.allowed_file_categories');
  if (!_.isEmpty(allFileExtData) && allowed_file_types && allowed_file_types.includes('*')) {
    let types: any = [];
    allowed_file_categories.forEach((item: string) => {
      if (Array.isArray(allFileExtData[item])) {
        types = [...types, ...allFileExtData[item]];
      }
    });
    // allowed_file_categories
    newAgentDetails.config.input.temp_zone_config.allowed_file_types = types;
  }
  return newAgentDetails;
};
