import { useState } from 'react';
import { Button, Card, Checkbox, Select, Stack, Text, TextField } from '@/shared/components';
import { studioSourceKinds, type StudioSourceKind } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { StudioSource } from '@/shared/types';

interface ElementSourcesProps {
  sources: StudioSource[];
  noSources: boolean;
  editable: boolean;
  onChange: (changes: { sources?: StudioSource[]; noSources?: boolean }) => void;
}

// "Declare any fonts, music or photos from other sources": each one with its license, or a statement that
// everything is the creator's own work.
export const ElementSources = ({ sources, noSources, editable, onChange }: ElementSourcesProps) => {
  const { text } = useLocale();
  const [kind, setKind] = useState<StudioSourceKind>(studioSourceKinds[0]);
  const [name, setName] = useState('');
  const [license, setLicense] = useState('');

  const add = () => {
    if (!name.trim() || !license.trim()) return;
    onChange({ sources: [...sources, { kind, name: name.trim(), license: license.trim() }], noSources: false });
    setName('');
    setLicense('');
  };

  return (
    <Card gap={vars.spacing[4]}>
      <Stack gap={vars.spacing[1]}>
        <Text as="h2" variant="h4">
          {text.studio.sourcesTitle}
        </Text>
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {text.studio.sourcesText}
        </Text>
      </Stack>
      {sources.length > 0 && (
        <Stack as="ul" gap={vars.spacing[2]}>
          {sources.map((source, index) => (
            <Stack key={`${source.name}-${index}`} as="li" direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
              <Text variant="bodySm">
                {text.studio.sourceKinds[source.kind]}: <bdi>{source.name}</bdi> · <bdi>{source.license}</bdi>
              </Text>
              {editable && (
                <Button variant="outline" size="sm" onClick={() => onChange({ sources: sources.filter((_, other) => other !== index) })}>
                  {text.studio.removeFile}
                </Button>
              )}
            </Stack>
          ))}
        </Stack>
      )}
      {editable && !noSources && (
        <Stack direction="row" wrap align="flex-end" gap={vars.spacing[3]}>
          <Select
            label={text.studio.sourceKind}
            value={kind}
            onChange={(value) => setKind(value as StudioSourceKind)}
            options={studioSourceKinds.map((option) => ({ value: option, label: text.studio.sourceKinds[option] }))}
          />
          <Stack grow>
            <TextField label={text.studio.sourceName} value={name} onChange={setName} />
          </Stack>
          <Stack grow>
            <TextField label={text.studio.sourceLicense} value={license} onChange={setLicense} />
          </Stack>
          <Button variant="outline" disabled={!name.trim() || !license.trim()} onClick={add}>
            {text.studio.addSource}
          </Button>
        </Stack>
      )}
      <Checkbox
        label={text.studio.noSources}
        checked={noSources}
        disabled={!editable || sources.length > 0}
        onChange={(checked) => onChange({ noSources: checked })}
      />
    </Card>
  );
};
