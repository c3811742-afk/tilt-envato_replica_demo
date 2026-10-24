import { useState } from 'react';
import { fetchContentRules, saveContentRules } from '@/features/admin/api';
import {
  Badge,
  Checkbox,
  DataTable,
  Notice,
  Panel,
  Stack,
  TextField,
  type DataTableColumn,
} from '@/features/admin/components';
import { contentRuleKeys } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { BlockedGeneration, ContentRules } from '@/features/admin/types';
import { isBlank, sameText } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';
import styles from './AiPage.module.css';

const dateTime: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

interface RulesFormProps {
  initialRules: ContentRules;
}

// The kinds of content the AI tools refuse, and extra words or phrases to block.
const RulesForm = ({ initialRules }: RulesFormProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.ai;
  const [rules, setRules] = useState(initialRules);
  const [phrase, setPhrase] = useState('');
  const [phraseError, setPhraseError] = useState<string>();
  const [notice, setNotice] = useState<string | null>(null);

  const addPhrase = () => {
    if (isBlank(phrase)) {
      setPhraseError(t.phraseRequired);
      return;
    }
    if (rules.blockedPhrases.some((existing) => sameText(existing, phrase))) {
      setPhraseError(t.phraseExists);
      return;
    }
    setPhraseError(undefined);
    setRules((current) => ({ ...current, blockedPhrases: [...current.blockedPhrases, phrase.trim()] }));
    setPhrase('');
  };

  const save = async () => {
    setNotice(null);
    const result = await run(() => saveContentRules(currentAdmin.id, rules));
    if (!result.ok) return;
    setRules(result.data);
    setNotice(t.rulesSaved);
  };

  return (
    <Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {error && <Notice tone="danger">{error}</Notice>}
      <Panel title={t.rulesTitle}>
        <Stack gap={vars.spacing[3]}>
          {contentRuleKeys.map((key) => (
            <Checkbox
              key={key}
              label={t.rules[key].label}
              description={t.rules[key].description}
              checked={rules.rules[key]}
              onChange={(checked) => setRules((current) => ({ ...current, rules: { ...current.rules, [key]: checked } }))}
            />
          ))}
        </Stack>
      </Panel>
      <Panel title={t.phrasesTitle}>
        <Text color={vars.colors.textMuted}>{t.phrasesDescription}</Text>
        {rules.blockedPhrases.length > 0 ? (
          <ul className={styles.phrases}>
            {rules.blockedPhrases.map((blocked) => (
              <li key={blocked} className={styles.phrase}>
                <Text as="span" autoDirection>
                  {blocked}
                </Text>
                <Button
                  size="sm"
                  variant="muted"
                  onClick={() =>
                    setRules((current) => ({
                      ...current,
                      blockedPhrases: current.blockedPhrases.filter((item) => item !== blocked),
                    }))
                  }
                >
                  {text.admin.common.remove}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <Text color={vars.colors.textMuted}>{t.noPhrases}</Text>
        )}
        <TextField label={t.phraseLabel} value={phrase} onChange={setPhrase} error={phraseError} autoDirection />
        <Stack direction="row">
          <Button variant="secondary" onClick={addPhrase}>
            {t.addPhrase}
          </Button>
        </Stack>
      </Panel>
      <Stack direction="row">
        <Button disabled={pending} onClick={save}>
          {text.admin.common.save}
        </Button>
      </Stack>
    </Stack>
  );
};

// What was blocked recently, so the rules can be checked against real cases.
const BlockedLog = ({ blocked }: { blocked: BlockedGeneration[] }) => {
  const { text, locale } = useLocale();
  const t = text.admin.ai;

  const columns: DataTableColumn<BlockedGeneration>[] = [
    { key: 'date', header: text.admin.columns.date, render: (row) => formatDate(row.at, locale, dateTime) },
    {
      key: 'user',
      header: text.admin.columns.user,
      render: (row) => (
        <Text as="span" autoDirection>
          {row.userName}
        </Text>
      ),
    },
    {
      key: 'tool',
      header: text.admin.columns.tool,
      render: (row) => (
        <Stack gap={vars.spacing[1]} align="start">
          <Text as="span">{t.tools[row.tool]}</Text>
          <Badge>{t.stages[row.stage]}</Badge>
        </Stack>
      ),
    },
    {
      key: 'excerpt',
      header: text.admin.columns.excerpt,
      render: (row) => (
        <Text as="span" autoDirection>
          {row.excerpt}
        </Text>
      ),
    },
    {
      key: 'rule',
      header: text.admin.columns.rule,
      render: (row) => (row.rule === 'phrase' ? t.phraseRule : t.rules[row.rule].label),
    },
  ];

  return (
    <Panel title={t.blockedTitle}>
      {blocked.length > 0 ? (
        <DataTable label={t.blockedTitle} columns={columns} rows={blocked} getRowKey={(row) => row.id} />
      ) : (
        <EmptyState title={t.blockedEmptyTitle} message={t.blockedEmptyMessage} />
      )}
    </Panel>
  );
};

export const RulesTab = () => {
  const { text } = useLocale();
  const data = useAsync(fetchContentRules, []);

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{text.admin.ai.rulesDescription}</Text>
      <AsyncContent state={data}>
        {({ rules, blocked }) => (
          <Stack>
            <RulesForm initialRules={rules} />
            <BlockedLog blocked={blocked} />
          </Stack>
        )}
      </AsyncContent>
    </Stack>
  );
};
