import { useState } from 'react'
import { Send, Users, UserCheck, Mail, FileText, Eye } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import TextArea from '../components/ui/TextArea'
import { useForm } from 'react-hook-form'
import { EMAIL_CONFIG, USER_ROLES } from '../config/constants'
import { formatPercent } from '../utils/helpers'

const SendEmail = () => {
  const [emailHistory, setEmailHistory] = useState([
    {
      id: 'EMAIL001',
      subject: 'Welcome to Premium!',
      recipients: 'All Users',
      recipientCount: 12543,
      template: 'welcome',
      status: 'sent',
      sentAt: '2024-01-20T10:30:00Z',
      openRate: 68.5,
      clickRate: 12.3
    },
    {
      id: 'EMAIL002',
      subject: 'System Maintenance Notice',
      recipients: 'Premium Users',
      recipientCount: 3456,
      template: 'notification',
      status: 'sent',
      sentAt: '2024-01-19T14:15:00Z',
      openRate: 82.1,
      clickRate: 5.7
    },
    {
      id: 'EMAIL003',
      subject: 'Password Reset Instructions',
      recipients: 'john@example.com',
      recipientCount: 1,
      template: 'password_reset',
      status: 'delivered',
      sentAt: '2024-01-20T16:45:00Z',
      openRate: 100,
      clickRate: 100
    }
  ])

  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
  const watchRecipientType = watch('recipientType')
  const watchTemplate = watch('template')

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newEmail = {
        id: `EMAIL${String(emailHistory.length + 1).padStart(3, '0')}`,
        subject: data.subject,
        recipients: data.recipientType === 'all' ? 'All Users' : 
                   data.recipientType === 'role' ? `${data.roleTarget} Users` :
                   data.specificEmails,
        recipientCount: data.recipientType === 'all' ? 12543 :
                       data.recipientType === 'role' ? 3456 : 
                       data.specificEmails?.split(',').length || 1,
        template: data.template,
        status: 'sent',
        sentAt: new Date().toISOString(),
        openRate: 0,
        clickRate: 0
      }
      
      setEmailHistory([newEmail, ...emailHistory])
      reset()
      alert('Email sent successfully!')
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    const formData = watch()
    
    // Generate preview content based on template and form data
    let content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #F16321;">${formData.subject || 'Email Subject'}</h1>
        <div style="margin: 20px 0;">
          ${formData.content || 'Email content will appear here...'}
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This email was sent to: ${
            formData.recipientType === 'all' ? 'All Users' :
            formData.recipientType === 'role' ? `${formData.roleTarget || 'Selected Role'} Users` :
            formData.specificEmails || 'Specific Recipients'
          }
        </p>
      </div>
    `
    
    setPreviewContent(content)
    setShowPreviewModal(true)
  }

  const totalSent = emailHistory.filter(e => e.status === 'sent').length
  const totalRecipients = emailHistory.reduce((sum, e) => sum + e.recipientCount, 0)
  const avgOpenRateVal = emailHistory.length > 0 
    ? (emailHistory.reduce((sum, e) => sum + e.openRate, 0) / emailHistory.length)
    : 0
  const avgClickRateVal = emailHistory.length > 0
    ? (emailHistory.reduce((sum, e) => sum + e.clickRate, 0) / emailHistory.length)
    : 0
  const avgOpenRate = formatPercent(avgOpenRateVal)
  const avgClickRate = formatPercent(avgClickRateVal)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sent</p>
              <p className="text-2xl font-bold text-blue-600">{totalSent}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recipients</p>
              <p className="text-2xl font-bold text-green-600">{totalRecipients.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Open Rate</p>
              <p className="text-2xl font-bold text-purple-600">{avgOpenRate}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Click Rate</p>
              <p className="text-2xl font-bold text-orange-600">{avgClickRate}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Composer */}
        <Card>
          <Card.Header>
            <Card.Title>Compose Email</Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Subject"
                {...register('subject', { required: 'Subject is required' })}
                error={errors.subject?.message}
                placeholder="Enter email subject"
              />

              <Select
                label="Recipients"
                options={[
                  { value: '', label: 'Select Recipients' },
                  { value: 'all', label: 'All Users' },
                  { value: 'role', label: 'By Role' },
                  { value: 'specific', label: 'Specific Emails' },
                ]}
                {...register('recipientType', { required: 'Recipient type is required' })}
                error={errors.recipientType?.message}
                placeholder="Select Recipients"
              />

              {watchRecipientType === 'role' && (
                <Select
                  label="Select Role"
                  options={[
                    { value: 'premium', label: 'Premium' },
                    { value: 'basic', label: 'Basic' },
                    { value: 'trial', label: 'Trial' },
                    { value: 'admin', label: 'Admin' },
                  ]}
                  {...register('roleTarget')}
                  placeholder="Select Role"
                />
              )}

              {watchRecipientType === 'specific' && (
                <TextArea
                  label="Email Addresses"
                  {...register('specificEmails')}
                  rows={3}
                  placeholder="Enter email addresses separated by commas"
                />
              )}

              <Select
                label="Email Template"
                options={[
                  { value: 'custom', label: 'Custom' },
                  { value: 'welcome', label: 'Welcome' },
                  { value: 'notification', label: 'Notification' },
                  { value: 'password_reset', label: 'Password Reset' },
                  { value: 'support', label: 'Support Reply' },
                ]}
                {...register('template')}
                placeholder="Select Template"
              />

              <TextArea
                label="Email Content"
                {...register('content', { required: 'Content is required' })}
                rows={8}
                placeholder="Enter your email content here..."
                error={errors.content?.message}
              />

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  icon={<Eye className="w-4 h-4" />}
                >
                  Preview
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                  icon={<Send className="w-4 h-4" />}
                  className="flex-1"
                >
                  {isLoading ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>

        {/* Email History */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Emails</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {emailHistory.map((email) => (
                <div key={email.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {email.subject}
                    </h4>
                    <Badge variant={
                      email.status === 'sent' ? 'success' :
                      email.status === 'delivered' ? 'info' :
                      'warning'
                    }>
                      {email.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>To: {email.recipients}</p>
                    <p>Recipients: {email.recipientCount.toLocaleString()}</p>
                    <p>Sent: {new Date(email.sentAt).toLocaleString()}</p>
                  </div>
                  
                  {email.status === 'sent' && (
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="font-medium text-purple-600">{formatPercent(email.openRate)}</p>
                        <p className="text-gray-500">Open Rate</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="font-medium text-orange-600">{formatPercent(email.clickRate)}</p>
                        <p className="text-gray-500">Click Rate</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Email Preview"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPreviewModal(false)}
            >
              Close Preview
            </Button>
            <Button
              onClick={() => {
                setShowPreviewModal(false)
                handleSubmit(onSubmit)()
              }}
              icon={<Send className="w-4 h-4" />}
            >
              Send Email
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SendEmail
