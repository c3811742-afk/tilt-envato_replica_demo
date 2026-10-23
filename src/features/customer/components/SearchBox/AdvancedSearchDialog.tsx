import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { AsyncContent, Button, ChipGroup, IconNote, Modal, Stack, stateMessageHeights, TextField } from '@/shared/components';
import { useAsync, useLocale, useSearchFilters } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { api } from '@/shared/utils';

interface AdvancedSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

// Require words, exclude words, and only include or leave out some creators.
export const AdvancedSearchDialog = ({ open, onClose }: AdvancedSearchDialogProps) => {
  const { text } = useLocale();
  return (
    <Modal open={open} onClose={onClose} title={text.advancedSearch.title}>
      {/* Mounted only while open, so the form starts from the current search each time. */}
      {open && <AdvancedSearchForm onDone={onClose} />}
    </Modal>
  );
};

// Starts from the search in the URL (empty when opened outside the search page).
const AdvancedSearchForm = ({ onDone }: { onDone: () => void }) => {
  const { text } = useLocale();
  const search = useSearchFilters();
  const navigate = useNavigate();
  const creators = useAsync(api.getCreators, []);
  const [query, setQuery] = useState(search.query);
  const [mustInclude, setMustInclude] = useState(search.mustInclude);
  const [exclude, setExclude] = useState(search.exclude);
  const [authors, setAuthors] = useState(search.authors);
  const [excludeAuthors, setExcludeAuthors] = useState(search.excludeAuthors);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(search.pathWith({ query, mustInclude, exclude, authors, excludeAuthors }));
    onDone();
  };

  return (
    <Stack as="form" gap={vars.spacing[5]} onSubmit={submit} noValidate>
      <TextField label={text.advancedSearch.query} value={query} onChange={setQuery} />
      <TextField label={text.advancedSearch.mustInclude} hint={text.advancedSearch.wordsHint} value={mustInclude} onChange={setMustInclude} />
      <TextField label={text.advancedSearch.exclude} hint={text.advancedSearch.wordsHint} value={exclude} onChange={setExclude} />
      <AsyncContent
        state={creators}
        minHeight={stateMessageHeights.compact}
        error={<IconNote icon="info" title={text.advancedSearch.noCreators} />}
      >
        {(list) => {
          const options = list.map((creator) => ({ value: creator.id, label: creator.name }));
          return (
            <>
              <ChipGroup
                label={text.advancedSearch.authors}
                multiple
                value={authors}
                onChange={(values) => {
                  setAuthors(values);
                  setExcludeAuthors((current) => current.filter((id) => !values.includes(id)));
                }}
                options={options}
              />
              <ChipGroup
                label={text.advancedSearch.excludeAuthors}
                multiple
                value={excludeAuthors}
                onChange={(values) => {
                  setExcludeAuthors(values);
                  setAuthors((current) => current.filter((id) => !values.includes(id)));
                }}
                options={options}
              />
            </>
          );
        }}
      </AsyncContent>
      <IconNote icon="info" title={text.advancedSearch.tip} />
      <Stack direction="row" justify="flex-end" gap={vars.spacing[3]}>
        <Button variant="outline" onClick={onDone}>
          {text.common.cancel}
        </Button>
        <Button type="submit">{text.advancedSearch.submit}</Button>
      </Stack>
    </Stack>
  );
};
