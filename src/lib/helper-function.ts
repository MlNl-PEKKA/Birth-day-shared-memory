import prisma from '@/lib/prisma';
import { Admin, AdminRole, NotificationType } from '@prisma/client';
import { Session } from 'next-auth';


export async function logAdminActivity(session: Session, action: string, type:NotificationType ): Promise<void> {
  if (!session || !session.user) {
    throw new Error('Invalid session or unauthorized user');
  }

  try {
    await prisma.activityLog.create({
      data: {
        action,
        type,
        admin_id: session.user.id ??"",
      },
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
    throw new Error('Failed to log activity');
  } finally {
    await prisma.$disconnect();
  }
}
export async function createNotification(message: string, type: NotificationType, link: string, user_id?: string, session?: Session): Promise<void> {
  let recipients: Admin[] = []
  if(type === NotificationType.FUNDING_UPDATE || type === NotificationType.INVOICE_UPDATE || type === NotificationType.MILESTONE_UPDATE){
    recipients = await prisma.admin.findMany({
      where: {role: AdminRole.ADMIN}
    })
    await prisma.notification.create({
      data: {message, type, link, ...(recipients.length > 0 && {admin: {connect: recipients.map((admin)=>({id: admin.id}))}})}
    })
  }else if(type === NotificationType.FUNDING_STATUS_UPDATE || type === NotificationType.INVOICE_STATUS_UPDATE || type === NotificationType.MILESTONE_STATUS_UPDATE || type === NotificationType.KYC_STATUS_UPDATE){
    const recipient = await prisma.user.findUnique({
      where: {id: user_id}
    })
    await prisma.notification.create({
      data: {message, type, link, ...(recipient && {user: {connect: {id: recipient?.id}}})}
    })
    if(session){
      await logAdminActivity(session, message, type)
    }
  }
}
