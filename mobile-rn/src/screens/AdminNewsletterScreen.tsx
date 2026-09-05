import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, CheckCircle, FileText, Clock } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { NewsletterIssue, adminListNewsletterIssues, adminCreateNewsletterIssue, adminSendNewsletterIssue } from '../lib/service';
import { ScreenScroll, ScreenTitle, Card, LoadingBlock, EmptyBlock, PrimaryButton, TextField, PdfPickerField } from '../components/ui';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminNewsletter'>;

// A newsletter issue is just a title + optional intro message + a PDF,
// uploaded straight to the `newsletters` Storage bucket (PdfPickerField).
// "Send" invokes the same send-newsletter Edge Function used for
// project/event auto-notify (kind: 'pdf'), mailing every newsletter
// subscriber and approved/guest member a link to the PDF via Resend.
export default function AdminNewsletterScreen({}: Props) {
  const [issues, setIssues] = useState<NewsletterIssue[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setIssues(await adminListNewsletterIssues());
    } catch (err: any) {
      setError(err?.message || 'Could not load newsletter issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateAndSend = async () => {
    if (!title || !pdfUrl) return;
    setCreating(true);
    setError('');
    setNotice('');
    try {
      const id = await adminCreateNewsletterIssue(title, message, pdfUrl);
      setTitle('');
      setMessage('');
      setPdfUrl('');
      await load();
      setSendingId(id);
      const count = await adminSendNewsletterIssue(id);
      setNotice(count > 0 ? `Newsletter sent to ${count} recipient${count === 1 ? '' : 's'}.` : 'Newsletter saved, but there are no subscribers or members to send it to yet.');
    } catch (err: any) {
      setError(err?.message || 'Could not send the newsletter.');
    } finally {
      setCreating(false);
      setSendingId(null);
      await load();
    }
  };

  const handleResend = async (id: string) => {
    setSendingId(id);
    setError('');
    setNotice('');
    try {
      const count = await adminSendNewsletterIssue(id);
      setNotice(count > 0 ? `Newsletter sent to ${count} recipient${count === 1 ? '' : 's'}.` : 'No subscribers or members to send it to yet.');
    } catch (err: any) {
      setError(err?.message || 'Could not send the newsletter.');
    } finally {
      setSendingId(null);
      await load();
    }
  };

  return (
    <ScreenScroll>
      <ScreenTitle title="Newsletter" subtitle="Upload a PDF newsletter and send it to subscribers and members." />

      {error ? (
        <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex-row items-center gap-2">
          <AlertTriangle size={16} color="#e11d48" />
          <Text className="text-xs text-rose-700 flex-1">{error}</Text>
        </View>
      ) : null}
      {notice ? (
        <View className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex-row items-center gap-2">
          <CheckCircle size={16} color={colors.rotaryAzure} />
          <Text className="text-xs text-sky-700 flex-1">{notice}</Text>
        </View>
      ) : null}

      <Card className="gap-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">New Issue</Text>
        <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. September 2026 Newsletter" />
        <TextField
          label="Message (optional)"
          value={message}
          onChangeText={setMessage}
          placeholder="A short note to include above the download link"
          multiline
        />
        <PdfPickerField label="Newsletter PDF" pdfUrl={pdfUrl} onChange={setPdfUrl} />
        <PrimaryButton
          label="Save & Send to Subscribers"
          onPress={handleCreateAndSend}
          loading={creating}
          disabled={!title || !pdfUrl}
        />
      </Card>

      <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">Past Issues</Text>
      {loading ? (
        <LoadingBlock label="Loading newsletter issues..." />
      ) : !issues || issues.length === 0 ? (
        <EmptyBlock label="No newsletter issues yet. Create one above." />
      ) : (
        <View className="gap-3">
          {issues.map((issue) => (
            <Card key={issue.id} className="gap-2">
              <View className="flex-row items-center gap-2">
                <FileText size={16} color={colors.rotaryAzure} />
                <Text className="text-sm font-extrabold text-slate-800 flex-1">{issue.title}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Clock size={12} color={colors.slate400} />
                <Text className="text-[11px] text-slate-400">{new Date(issue.createdAt).toLocaleString()}</Text>
              </View>
              {issue.sendStatus === 'sent' ? (
                <Text className="text-[11px] font-bold text-emerald-600">Sent to {issue.recipientCount} recipient{issue.recipientCount === 1 ? '' : 's'}</Text>
              ) : issue.sendStatus === 'failed' ? (
                <Text className="text-[11px] font-bold text-rose-600">Send failed{issue.sendError ? `: ${issue.sendError}` : ''}</Text>
              ) : (
                <Text className="text-[11px] font-bold text-slate-400">Not sent yet</Text>
              )}
              <PrimaryButton
                label={issue.sendStatus === 'sent' ? 'Resend' : 'Send Now'}
                onPress={() => handleResend(issue.id)}
                loading={sendingId === issue.id}
                variant="outline"
              />
            </Card>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}
