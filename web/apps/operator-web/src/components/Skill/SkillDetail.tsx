import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Empty, Layout, Skeleton, Tree, Typography, message } from 'antd';
import { FileTextOutlined, FolderOpenOutlined } from '@ant-design/icons';
import emptyImage from '@/assets/images/empty2.png';
import '@/components/Operator/style.less';
import styles from './SkillDetail.module.less';
import {
  getSkillContent,
  getSkillInfo,
  getSkillMarketInfo,
  readSkillFile,
} from '@/apis/agent-operator-integration';
import { postResourceOperation } from '@/apis/authorization';
import DetailHeader from '@/components/OperatorList/DetailHeader';
import { OperateTypeEnum, OperatorTypeEnum, PermConfigTypeEnum } from '@/components/OperatorList/types';
import {
  buildSkillTreeData,
  fetchRemoteText,
  findSkillTreeNode,
  type SkillFileSummary,
  type SkillTreeNode,
  unwrapSkillResponse,
} from './shared';

const { Sider, Content } = Layout;
const { Paragraph, Text } = Typography;

export default function SkillDetail() {
  const [searchParams] = useSearchParams();
  const skillId = searchParams.get('skill_id') || '';
  const action = searchParams.get('action') || '';
  const [skillInfo, setSkillInfo] = useState<any>({});
  const [permissionCheckInfo, setPermissionCheckInfo] = useState<Array<PermConfigTypeEnum>>();
  const [treeData, setTreeData] = useState<SkillTreeNode[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('file:SKILL.md');
  const [contentManifest, setContentManifest] = useState<any>({});
  const [contentValue, setContentValue] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState('');
  const [detailLoading, setDetailLoading] = useState(true);

  const selectedNode = useMemo(() => findSkillTreeNode(treeData, selectedKey), [treeData, selectedKey]);

  useEffect(() => {
    fetchSkillInfo();
    fetchPermission();
    fetchSkillContent();
  }, [skillId, action]);

  useEffect(() => {
    if (!selectedNode && selectedKey !== 'file:SKILL.md') {
      return;
    }

    loadSelectedContent();
  }, [selectedNode, selectedKey, contentManifest?.url, skillId]);

  const fetchSkillInfo = async () => {
    setDetailLoading(true);
    try {
      const response =
        action === OperateTypeEnum.View ? await getSkillMarketInfo(skillId) : await getSkillInfo(skillId);
      setSkillInfo(unwrapSkillResponse(response));
    } catch (error: any) {
      if (error?.description) {
        message.error(error.description);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchSkillContent = async () => {
    try {
      const response = await getSkillContent(skillId);
      const payload = unwrapSkillResponse<any>(response);
      const files = Array.isArray(payload?.files) ? (payload.files as SkillFileSummary[]) : [];
      setContentManifest(payload);
      setTreeData(buildSkillTreeData(files));
      setSelectedKey('file:SKILL.md');
    } catch (error: any) {
      if (error?.description) {
        message.error(error.description);
      }
    }
  };

  const fetchPermission = async () => {
    try {
      const data = await postResourceOperation({
        method: 'GET',
        resources: [
          {
            id: skillId,
            type: OperatorTypeEnum.Skill,
          },
        ],
      });
      setPermissionCheckInfo(data?.[0]?.operation);
    } catch (error: any) {
      console.error(error);
    }
  };

  const loadSelectedContent = async () => {
    const targetNode = selectedNode || {
      key: 'file:SKILL.md',
      rel_path: 'SKILL.md',
      nodeType: 'file',
      title: 'SKILL.md',
      path: 'SKILL.md',
    };

    if (targetNode.nodeType === 'directory') {
      setContentError('');
      setContentValue('');
      return;
    }

    setContentLoading(true);
    setContentError('');
    try {
      let url = '';
      if (targetNode.rel_path === 'SKILL.md') {
        url = contentManifest?.url;
      } else {
        const fileResponse = await readSkillFile(skillId, { rel_path: targetNode.rel_path });
        url = unwrapSkillResponse<any>(fileResponse)?.url;
      }

      if (!url) {
        throw new Error('文件地址不存在');
      }

      const text = await fetchRemoteText(url);
      setContentValue(text);
    } catch (error: any) {
      setContentValue('');
      setContentError(error?.description || error?.message || '文件内容加载失败');
    } finally {
      setContentLoading(false);
    }
  };

  return (
    <div className="operator-detail">
      <DetailHeader
        type={OperatorTypeEnum.Skill}
        detailInfo={skillInfo}
        fetchInfo={() => {
          fetchSkillInfo();
          fetchSkillContent();
        }}
        permissionCheckInfo={permissionCheckInfo}
      />
      <Layout className={styles.layout}>
        <Sider width={360} className="operator-detail-sider">
          <div className="operator-detail-sider-content">
            <Text strong>
              <FolderOpenOutlined /> 文件
            </Text>
          </div>
          <div className={styles.tree}>
            {treeData.length ? (
              <Tree
                blockNode
                showIcon
                defaultExpandAll
                selectedKeys={[selectedKey]}
                treeData={treeData.map(node => ({
                  ...node,
                  icon: node.nodeType === 'directory' ? <FolderOpenOutlined /> : <FileTextOutlined />,
                }))}
                onSelect={keys => {
                  if (keys[0]) {
                    setSelectedKey(String(keys[0]));
                  }
                }}
              />
            ) : (
              <Empty
                image={<img src={emptyImage} alt="empty" className={styles.emptyImage} />}
                description="暂无文件"
              />
            )}
          </div>
        </Sider>
        <Content className={styles.content}>
          <div className={styles.viewer}>
            <div className={styles.viewerHeader}>
              <Text strong>{selectedNode?.title || 'SKILL.md'}</Text>
              {selectedNode?.nodeType === 'directory' && <Text type="secondary">预览区</Text>}
            </div>
            {selectedNode?.nodeType === 'directory' ? (
              <div className={styles.previewEmpty}>
                <Empty
                  image={<img src={emptyImage} alt="empty" className={styles.emptyImage} />}
                  description="右侧为预览区，请选择文件进行预览"
                />
              </div>
            ) : (
              <Skeleton active loading={detailLoading || contentLoading}>
                {contentError ? (
                  <Alert type="error" showIcon message={contentError} />
                ) : (
                  <Paragraph className={styles.code}>
                    <pre>{contentValue || ''}</pre>
                  </Paragraph>
                )}
              </Skeleton>
            )}
          </div>
        </Content>
      </Layout>
    </div>
  );
}
