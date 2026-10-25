import { useState } from 'react';
import { fetchContentRules, saveContentRules } from '@/features/admin/api';
import { contentRuleKeys } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { BlockedGeneration, ContentRules } from '@/features/admin/types';
import { isBlank, sameText } from '@/features/admin/utils';
import { AsyncContent, Badge, Button, Card, Checkbox, Chip, EmptyState, Icon, Notice, type RecordColumn, recordRows, Stack, Table, Text, TextField } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';

const dateTime: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

interface RulesFormProps {
  initialRules: ContentRules;
}

// The kinds of content the AI tools refuse, and extra words or phrases to block.
const RulesForm = ({ initialRules }: RulesFormProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
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
      <Card title={t.rulesTitle}>
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
      </Card>
      <Card title={t.phrasesTitle}>
        <Text color={vars.colors.textMuted}>{t.phrasesDescription}</Text>
        {rules.blockedPhrases.length > 0 ? (
          // Removable, like the search page's active filters: the whole chip removes the phrase.
          <Stack as="ul" direction="row" wrap gap={vars.spacing[2]}>
            {rules.blockedPhrases.map((blocked) => (
              <li key={blocked}>
                <Chip
                  selected
                  onClick={() =>
                    setRules((current) => ({
                      ...current,
                      blockedPhrases: current.blockedPhrases.filter((item) => item !== blocked),
                    }))
                  }
                >
                  <span dir="auto">{blocked}</span>
                  <Icon name="close" size={vars.sizes.icon.sm} label={`${text.admin.common.remove} ${blocked}`} />
                </Chip>
              </li>
            ))}
          </Stack>
        ) : (
          <Text color={vars.colors.textMuted}>{t.noPhrases}</Text>
        )}
        <TextField label={t.phraseLabel} value={phrase} onChange={setPhrase} error={phraseError} />
        <Stack direction="row" wrap>
          <Button variant="secondary" onClick={addPhrase}>
            {t.addPhrase}
          </Button>
        </Stack>
      </Card>
      <Stack direction="row" wrap>
        <Button disabled={pending} onClick={save}>
          {text.common.saveChanges}
        </Button>
      </Stack>
    </Stack>
  );
};

// What was blocked recently, so the rules can be checked against real cases.
const BlockedLog = ({ blocked }: { blocked: BlockedGeneration[] }) => {
  const { text, locale } = useLocale();
  const t = text.admin.ai;

  const columns: RecordColumn<BlockedGeneration>[] = [
    { key: 'date', label: text.admin.columns.date, render: (row) => formatDate(row.at, locale, dateTime) },
    {
      key: 'user',
      label: text.admin.columns.user,
      render: (row) => (
        <Text as="span" autoDirection>
          {row.userName}
        </Text>
      ),
    },
    {
      key: 'tool',
      label: text.admin.columns.tool,
      render: (row) => (
        <Stack gap={vars.spacing[1]} align="flex-start">
          <Text as="span">{text.ai.tools[row.tool].name}</Text>
          <Badge>{t.stages[row.stage]}</Badge>
        </Stack>
      ),
    },
    {
      key: 'excerpt',
      label: text.admin.columns.excerpt,
      render: (row) => (
        <Text as="span" autoDirection>
          {row.excerpt}
        </Text>
      ),
    },
    {
      key: 'rule',
      label: text.admin.columns.rule,
      render: (row) => (row.rule === 'phrase' ? t.phraseRule : t.rules[row.rule].label),
    },
  ];

  return (
    <Card title={t.blockedTitle}>
      {blocked.length > 0 ? (
        <Table label={t.blockedTitle} columns={columns} rows={recordRows(blocked, (row) => row.id, columns)} stackOnMobile />
      ) : (
        <EmptyState title={t.blockedEmptyTitle} message={t.blockedEmptyMessage} />
      )}
    </Card>
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
