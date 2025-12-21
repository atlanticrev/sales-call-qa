'use client';

import { FormEvent, useRef, useState } from 'react';
import {
  Button,
  Card,
  FormControl,
  FormHelperText,
  LinearProgress,
  Modal,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { VisuallyHiddenInput } from '../visually-hidden-input';
import styles from './styles.module.scss';
import { BACKEND_URL } from '@/app/_lib/backend';

type StartResponse = {
  jobId: string;
};

async function startProcess(formData: FormData): Promise<StartResponse> {
  const res = await fetch(`${BACKEND_URL}/process/start`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to start process');
  }

  return res.json();
}


const defaultFileInputText = 'Upload audio file (.mp3, .wav)';

type ProgressEvent = {
  stage: string;
  level?: string;
  message: string;
};

export function PromptEditor() {
  const formRef = useRef<HTMLFormElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fileInputText, setFileInputText] = useState(defaultFileInputText);

  const [open, setOpen] = useState(false);

  const [statusText, setStatusText] = useState<string>('');

  const [details, setDetails] = useState<string[]>([]);

  const [jobId, setJobId] = useState<string | null>(null);

  const [isDone, setIsDone] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(formRef.current ?? undefined);

    /**
     * Client validation
     */
    if (!formData.get('prompt')) {
      setErrors({ prompt: 'Prompt cannot be empty' });
      return;
    }

    if (!formData.get('file') || !(formData.get('file') instanceof File)) {
      setErrors({ file: 'File cannot be empty' });
      return;
    }

    /**
     * Start process
     */
    setErrors({});
    setDetails([]);
    setIsDone(false);
    setIsLoading(true);

    try {
      const { jobId } = await startProcess(formData);

      setJobId(jobId);
      setOpen(true);

      const eventSource = new EventSource(`${BACKEND_URL}/process/stream?jobId=${jobId}`);

      eventSource.addEventListener('message', (event) => {
        const progressEvent: ProgressEvent = JSON.parse(event.data);

        setStatusText(`Stage: ${progressEvent.stage}`);

        if (progressEvent.stage === 'done') {
          setIsDone(true);
          setIsLoading(false);
          eventSource.close();
          return;
        }

        if (progressEvent.stage === 'error') {
          setIsLoading(false);
          eventSource.close();
          return;
        }

        setDetails((prevDetails) => [...prevDetails, progressEvent.message]);
      });

      eventSource.addEventListener('error', () => {
        setIsLoading(false);
        eventSource.close();
      });
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  const handleModalClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Stack
        ref={formRef}
        spacing={4}
        className={styles.editor}
        component="form"
        onSubmit={handleSubmit}
      >
        <FormControl error={Boolean(errors['file'])}>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            {fileInputText}

            <VisuallyHiddenInput
              name="file"
              onChange={(event) => {
                const files = event.target.files;
                if (files?.length) {
                  setFileInputText(files[0].name);
                }
              }}
            />
          </Button>

          {errors['file'] && <FormHelperText>{errors['file']}</FormHelperText>}
        </FormControl>

        <TextField
          name="prompt"
          label="Prompt"
          multiline
          minRows={6}
          fullWidth
          error={Boolean(errors['prompt'])}
          helperText={errors['prompt']}
        />

        <Button type="submit" variant="contained" disabled={isLoading}>
          Send
        </Button>
      </Stack>

      <Modal open={open} onClose={() => { }}>
        <Card
          sx={{
            minWidth: 400,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 4,
          }}
        >
          {isLoading && <LinearProgress sx={{ mb: 1 }} />}

          <Typography variant="h6">{statusText || 'Starting…'}</Typography>

          {details.length > 0 && (
            <Stack spacing={0.5} mt={2}>
              {details.map((d, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  color="text.secondary"
                >
                  • {d}
                </Typography>
              ))}
            </Stack>
          )}

          {isDone && jobId && (
            <Button
              sx={{ mt: 3 }}
              variant="contained"
              href={`${BACKEND_URL}/process/result?jobId=${jobId}`}
              color="success"
              onClick={handleModalClose}
            >
              Download PDF
            </Button>
          )}
        </Card>
      </Modal>
    </>
  );
}
