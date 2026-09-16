'use client'

import { Button } from '@acolhemais/ui/components/button'
import { DialogClose } from '@acolhemais/ui/components/dialog'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { TextField } from '@/components/text-field'
import { panelServices } from '@/services/panel'

const schema = z.object({
  reason: z.string().trim().min(1, 'reasonRequired').max(1000, 'tooLong'),
  message: z.string().trim().min(1, 'messageRequired').max(1000, 'tooLong'),
})

/**
 * Recusa (BR-077): o motivo fica só com a organização; a mensagem vai para o adotante. Neutra
 * para a reputação dele.
 */
export function RefuseForm({
  applicationId,
  applicantName,
  animalName,
  organizationName,
  onDone,
}: {
  applicationId: string
  applicantName: string
  animalName: string
  organizationName: string
  onDone: () => void
}) {
  const t = useTranslations('Panel.file.refuse')
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await authClient.getSession()
      if (response.error) throw response.error

      return response.data
    },
  })
  const by = session?.user.name ?? ''
  const queryClient = useQueryClient()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: '',
      message: t('defaultMessage', {
        name: applicantName.split(' ')[0] ?? applicantName,
        animal: animalName,
        organization: organizationName,
      }),
    },
  })

  const refuse = useMutation({
    mutationFn: ({ reason, message }: z.infer<typeof schema>) =>
      panelServices.refuse(applicationId, reason, message, by),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['panel'] })
      onDone()
    },
  })

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((data) => refuse.mutate(data))}
      className="mt-6 flex flex-col gap-1"
    >
      <TextField
        control={form.control}
        name="reason"
        label={t('reason')}
        description={t('reasonHint')}
        multiline
      />
      <TextField
        control={form.control}
        name="message"
        label={t('message', { name: applicantName })}
        description={t('messageHint')}
        multiline
      />
      <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <DialogClose render={<Button variant="outline" />}>{t('cancel')}</DialogClose>
        <Button
          type="submit"
          variant="destructive"
          disabled={refuse.isPending}
          aria-busy={refuse.isPending}
        >
          {refuse.isPending && <Spinner />}
          {refuse.isPending ? t('refusing') : t('submit')}
        </Button>
      </div>
    </form>
  )
}
