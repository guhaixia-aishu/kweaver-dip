import ReactJson from 'react-json-view';
import { Collapse } from 'antd';
import { EditOutlined, FolderOpenOutlined, ProfileOutlined } from '@ant-design/icons';
import { formatTime } from '@/utils/operator';
import styles from './SkillInfo.module.less';

const { Panel } = Collapse;

export default function SkillInfo({ skillInfo }: { skillInfo: any }) {
  return (
    <div className="operator-info skill-info">
      <Collapse ghost defaultActiveKey={['1', '2']} expandIconPosition="end" className="operator-details-collapse">
        <Panel
          key="1"
          header={
            <span>
              <ProfileOutlined /> Skill Info <EditOutlined />
            </span>
          }
        >
          <div style={{ padding: '0 16px' }}>
            <div className="operator-info-title">Skill ID</div>
            <div className="operator-info-desc">{skillInfo?.skill_id || '-'}</div>
            <div className="operator-info-title">Name</div>
            <div className="operator-info-desc">{skillInfo?.name || '-'}</div>
            <div className="operator-info-title">Description</div>
            <div className="operator-info-desc">{skillInfo?.description || '-'}</div>
            <div className="operator-info-title">Version</div>
            <div className="operator-info-desc">{skillInfo?.version || '-'}</div>
            <div className="operator-info-title">Source</div>
            <div className="operator-info-desc">{skillInfo?.source || '-'}</div>
            <div className="operator-info-title">Created / Updated By</div>
            <div className="operator-info-desc">
              {(skillInfo?.create_user || '-') + ' / ' + (skillInfo?.update_user || '-')}
            </div>
            <div className="operator-info-title">Created / Updated At</div>
            <div className="operator-info-desc">
              {(skillInfo?.create_time ? formatTime(skillInfo.create_time) : '-') +
                ' / ' +
                (skillInfo?.update_time ? formatTime(skillInfo.update_time) : '-')}
            </div>
          </div>
        </Panel>
        <Panel
          key="2"
          header={
            <span>
              <FolderOpenOutlined /> Metadata
            </span>
          }
        >
          <div className={styles.json}>
            <div className={styles.jsonBlock}>
              <div className="operator-info-title">dependencies</div>
              <ReactJson src={skillInfo?.dependencies || {}} name={false} collapsed={1} enableClipboard={false} />
            </div>
            <div className={styles.jsonBlock}>
              <div className="operator-info-title">extend_info</div>
              <ReactJson src={skillInfo?.extend_info || {}} name={false} collapsed={1} enableClipboard={false} />
            </div>
          </div>
        </Panel>
      </Collapse>
    </div>
  );
}
