import prisma from '@/lib/prisma';
import { z } from 'zod';
import { ApprovalStatus, NotificationType, Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt'
import { createNotification } from "@/lib/helper-function";
import { publicProcedure } from '../trpc';
import { adminUpdateSchema, fundingRequestUpdateSchema, invoiceUpdateSchema, kycUpdateSchema, vendorSchema } from '@/lib/dtos';
import { milestoneUpdateSchema } from '@/lib/dtos';

export const getAllMilestones = publicProcedure 
  .input(
    z.object({
      search: z.string().optional(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "NOT_SUBMITTED"]).optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
      dueDateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      }).optional(),
      dueDateFilter: z.enum([
        "all",
        "overdue",
        "due-today",
        "due-this-week",
        "due-this-month",
      ]).optional(),
      paymentStatus: z.enum(["paid", "unpaid", "all"]).optional(),
      amountRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
    })
  )
  .query(async ({ input }) => {
    const {
      search,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
      dueDateRange,
      dueDateFilter,
      paymentStatus,
      amountRange,
    } = input;

    const skip = (page - 1) * limit;
    const where: Prisma.MilestoneWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { user: { first_name: { contains: search, mode: "insensitive" } } },
        { user: { last_name: { contains: search, mode: "insensitive" } } },
        { invoice: { invoice_number: { contains: search, mode: "insensitive" } } },
        { bank_name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status as ApprovalStatus;
    }

    // Due date range filter
    if (dueDateRange) {
      where.due_date = {
        ...(dueDateRange.from && { gte: dueDateRange.from }),
        ...(dueDateRange.to && { lte: dueDateRange.to }),
      };
    }

    // Due date preset filters
    if (dueDateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filters: Record<string, Prisma.DateTimeFilter> = {
        "overdue": {
          lt: today,
        },
        "due-today": {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        "due-this-week": {
          gte: today,
          lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        "due-this-month": {
          gte: today,
          lt: new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          ),
        },
      };

      if (dueDateFilter !== "all") {
        where.due_date = filters[dueDateFilter];
      }
    }

    // Payment status filter
    if (paymentStatus && paymentStatus !== "all") {
      where.paid_at = paymentStatus === "paid" ? { not: null } : null;
    }

    // Amount range filter
    if (amountRange) {
      where.payment_amount = {
        ...(amountRange.min !== undefined && { gte: amountRange.min }),
        ...(amountRange.max !== undefined && { lte: amountRange.max }),
      };
    }

    const total = await prisma.milestone.count({ where });
    const orderBy: Prisma.MilestoneOrderByWithRelationInput = sortBy
      ? sortBy === "user"
        ? { user: { first_name: sortOrder } }
        : sortBy === "invoice"
        ? { invoice: { invoice_number: sortOrder } }
        : { [sortBy]: sortOrder }
      : { created_at: "desc" };

    const milestones = await prisma.milestone.findMany({
      where,
      include: {
        user: true,
        invoice: true,
        reviewed_by: true,
      },
      skip,
      take: limit,
      orderBy,
    });

    return {
      data: milestones,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

export const getAdminData = publicProcedure
  .query(async ({ctx}) => { 
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be logged in'
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        notifications: true
      }
    });

    if (!admin) {
      throw new Error('No admin found');
    }

    return admin;
  });

export const updateMilestoneSatus = publicProcedure
  .input(milestoneUpdateSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be logged in'
      });
    }

    const { id, status } = input;

    const milestone = await prisma.milestone.update({
      where: { id: String(id) },
      data: { 
        status,
        reviewed_by: ctx.session.user.id
      },
    });

    await createNotification(
      `Milestone has been ${status}`,
      NotificationType.MILESTONE_STATUS_UPDATE,
      `${milestone.id}`,
      milestone.user_id,
      ctx.session
    );

    return milestone;
  });

export const getAllKYCDocuments = publicProcedure
  .input(z.object({
    search: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'NOT_SUBMITTED']).optional(),
    page: z.number().default(1),
    limit: z.number().default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }))
  .query(async ({ input }) => {
    const {
      search,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    } = input;

    const skip = (page - 1) * limit;

    const where: Prisma.KYCDocumentWhereInput = {};
    
    if (search) {
      where.OR = [
        { user: { first_name: { contains: search, mode: 'insensitive' } } },
        { user: { last_name: { contains: search, mode: 'insensitive' } } },
        { user: { company_name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { industry: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const total = await prisma.kYCDocument.count({ where });

    const orderBy: Prisma.KYCDocumentOrderByWithRelationInput = {};
    if (sortBy) {
      if (sortBy === 'company') {
        orderBy.user = { company_name: sortOrder };
      } else {
        orderBy[sortBy as keyof Prisma.KYCDocumentOrderByWithRelationInput] = sortOrder; 
      }
    } else {
      orderBy.submission_date = 'desc';
    }

    const kycDocuments = await prisma.kYCDocument.findMany({
      where,
      include: { user: true },
      skip,
      take: limit,
      orderBy,
    });

    return {
      data: kycDocuments,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  });

export const getAdminDashboardSummary = publicProcedure
  .query(async ({ ctx }) => {
    const adminId = ctx.session?.user?.id;

    if (!adminId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: "Unauthorized: Admin ID is missing"
      });
    }

    try {
      const admin = await prisma.admin.findUnique({
        where: {
          id: adminId,
        },
      });

      if (!admin) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "Admin not found"
        });
      }

      const pendingInvoices = await prisma.invoice.count({
        where: {
          status: "PENDING",
          deleted_at: null,
        },
      });

      const pendingFundRequest = await prisma.fundingRequest.count({
        where: {
          status: "PENDING",
          deleted_at: null,
        },
      });

      const totalFundedResult = await prisma.fundingRequest.aggregate({
        _sum: {
          requested_amount: true, 
        },
        where: {
          status: "APPROVED",
          deleted_at: null,
        },
      });

      const totalFunded = totalFundedResult._sum.requested_amount || 0;

      const pendingMilestone = await prisma.milestone.count({
        where: {
          status: "PENDING",
          deleted_at: null,
        },
      });

      const recentActivity = await prisma.activityLog.findMany({
        where: {
          admin_id: adminId,
        },
        orderBy: {
          created_at: "desc", 
        },
        take: 10,
      });

      const unreadNotifications = await prisma.notification.findMany({
        where: {
          is_read: false,
          deleted_at: null,
        },
        orderBy: {
          created_at: "desc",
        }
      });

      return {
        admin,
        pendingInvoices,
        pendingFundRequest,
        totalFunded,
        pendingMilestone,
        recentActivity,
        unreadNotifications,
      };

    } catch (error) {
      console.error("Error fetching admin dashboard summary:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: "Failed to retrieve admin dashboard summary"
      });
    }
  });

export const updateKYCDocument = publicProcedure
  .input(kycUpdateSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be logged in',
      });
    }

    const { status, kyc_id } = input;

    const kycDocument = await prisma.kYCDocument.update({
      where: { id: String(kyc_id) },
      data: {
        status,
        review_date: new Date(),
        reviewed_by: ctx.session.user.id,
      },
    });

    await createNotification(
      `KYC document has been ${status}`,
      NotificationType.KYC_STATUS_UPDATE,
      `${kyc_id}`,
      kycDocument.user_id,
      ctx.session
    );

    return kycDocument;
  });

export const updateFundingRequest = publicProcedure
  .input(fundingRequestUpdateSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be logged in',
      });
    }

    const { status, funding_request_id: id } = input;

    const fundingRequest = await prisma.fundingRequest.update({
      where: { id: String(id) },
      data: {
        status,
        review_date: new Date(),
        reviewed_by: ctx.session.user.id,
      },
    });

    await createNotification(
      `Funding request has been ${status}`,
      NotificationType.FUNDING_STATUS_UPDATE,
      `${fundingRequest.id}`,
      fundingRequest.user_id,
      ctx.session
    );

    return fundingRequest;
  });

export const updateInvoiceStatus = publicProcedure
  .input(invoiceUpdateSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be logged in',
      });
    }

    const { status, invoice_id: id } = input;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        review_date: new Date(),
        admin_id: ctx.session.user.id,
      },
    });

    await createNotification(
      `Invoice has been ${status}`,
      NotificationType.INVOICE_STATUS_UPDATE,
      `${invoice.id}`,
      invoice.user_id,
      ctx.session
    );

    return invoice;
  });

export const createVendor = publicProcedure
  .input(vendorSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be logged in',
      });
    }

    const { 
      name,
      contact_person,
      contact_person_phone_number,
      phone_number,
      address,
      email,
      bank_name,
      bank_account_number,
    } = input;

    const vendor = await prisma.vendor.create({
      data: {
        name,
        contact_person,
        contact_person_phone_number,
        bank_name,
        bank_account_number,
        phone_number,
        address,
        email,
        created_by: ctx.session.user.id,
      },
      select: {
        email: true
      }
    });

    return vendor;
  });

export const getAllInvoices = publicProcedure
  .input(
    z.object({
      search: z.string().optional(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "NOT_SUBMITTED"]).optional(),
      vendor: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
      dueDateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      }).optional(),
      dueDateFilter: z.enum([
        "all",
        "overdue",
        "due-today",
        "due-this-week",
        "due-this-month",
      ]).optional(),
    })
  )
  .query(async ({ input }) => {
    const {
      search,
      status,
      vendor,
      page,
      limit,
      sortBy,
      sortOrder,
      dueDateRange,
      dueDateFilter,
    } = input;
    
    const skip = (page - 1) * limit;
    const where: Prisma.InvoiceWhereInput = {};
    
    if (search) {
      where.OR = [
        { user: { first_name: { contains: search, mode: "insensitive" } } },
        { user: { last_name: { contains: search, mode: "insensitive" } } },
        { description: { contains: search, mode: "insensitive" } },
        { invoice_number: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status as ApprovalStatus;
    }

    if (vendor) {
      where.vendor = { name: { contains: vendor, mode: "insensitive" } };
    }

    if (dueDateRange) {
      where.due_date = {
        ...(dueDateRange.from && { gte: dueDateRange.from }),
        ...(dueDateRange.to && { lte: dueDateRange.to }),
      };
    }

    if (dueDateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filters: Record<string, Prisma.DateTimeFilter> = {
        "overdue": {
          lt: today,
        },
        "due-today": {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        "due-this-week": {
          gte: today,
          lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        "due-this-month": {
          gte: today,
          lt: new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          ),
        },
      };

      if (dueDateFilter !== "all") {
        where.due_date = filters[dueDateFilter];
      }
    }

    const total = await prisma.invoice.count({ where });
    const orderBy: Prisma.InvoiceOrderByWithRelationInput = sortBy
      ? sortBy === "vendor"
        ? { vendor: { name: sortOrder } }
        : { [sortBy]: sortOrder }
      : { submission_date: "desc" };

    const invoices = await prisma.invoice.findMany({
      where,
      include: { user: true, vendor: true },
      skip,
      take: limit,
      orderBy,
    });

    return {
      data: invoices,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

export const getAllFundingRequests = publicProcedure
  .input(
    z.object({
      search: z.string().optional(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
      milestone: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
      dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      }).optional(),
      amountRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      contributionRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      reviewStatus: z.enum(["reviewed", "pending", "all"]).optional(),
    })
  )
  .query(async ({ input }) => {
    const {
      search,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
      dateRange,
      amountRange,
      contributionRange,
      reviewStatus,
    } = input;

    const skip = (page - 1) * limit;
    const where: Prisma.FundingRequestWhereInput = {};

    if (search) {
      where.OR = [
        { user: { first_name: { contains: search, mode: "insensitive" } } },
        { user: { last_name: { contains: search, mode: "insensitive" } } },
        { invoice: { description: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status as ApprovalStatus;
    }

    if (dateRange) {
      where.submission_date = {
        ...(dateRange.from && { gte: dateRange.from }),
        ...(dateRange.to && { lte: dateRange.to }),
      };
    }

    if (amountRange) {
      where.requested_amount = {
        ...(amountRange.min !== undefined && { gte: amountRange.min }),
        ...(amountRange.max !== undefined && { lte: amountRange.max }),
      };
    }

    if (contributionRange) {
      where.your_contribution = {
        ...(contributionRange.min !== undefined && { gte: contributionRange.min }),
        ...(contributionRange.max !== undefined && { lte: contributionRange.max }),
      };
    }

    if (reviewStatus && reviewStatus !== "all") {
      where.review_date = reviewStatus === "reviewed" ? { not: null } : null;
    }

    const total = await prisma.fundingRequest.count({ where });
    const orderBy: Prisma.FundingRequestOrderByWithRelationInput = sortBy
      ? sortBy === "user"
        ? { user: { first_name: sortOrder } }
        : sortBy === "invoice"
        ? { invoice: { description: sortOrder } }
        : { [sortBy]: sortOrder }
      : { submission_date: "desc" };

    const fundingRequests = await prisma.fundingRequest.findMany({
      where,
      include: {
        user: true,
        invoice: true,
        reviewed_by: true,
      },
      skip,
      take: limit,
      orderBy,
    });

    return {
      data: fundingRequests,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

export const getAdminProfile = publicProcedure
  .query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be logged in',
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: ctx.session.user.id }
    });
    
    if (!admin) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Admin not found'
      });
    }

    return admin;
  });

export const updateAdminData = publicProcedure
  .input(adminUpdateSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, email, name, current_password, new_password } = input;
    
    const existingAdmin = await prisma.admin.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        password: true,
        role: true,
      },
    });

    if (!ctx.session?.user?.role) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be logged in',
      });
    }

    if (existingAdmin.role !== ctx.session.user.role && 
        ctx.session.user.role !== 'SUPER_ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions to modify admin role',
      });
    }

    let password_hash: string | undefined;
    if (current_password && new_password) {
      const isPasswordValid = await bcrypt.compare(
        current_password,
        existingAdmin.password
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Current password is incorrect',
        });
      }

      password_hash = await bcrypt.hash(new_password, 12);
    } else if ((current_password && !new_password) || 
               (!current_password && new_password)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Both current and new passwords must be provided to update password',
      });
    }

    try {
      const updatedAdmin = await prisma.admin.update({
        where: { id },
        data: {
          email,
          name,
          ...(password_hash && { password_hash }),
          updated_at: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      });

      return updatedAdmin;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already exists',
          });
        }
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update admin data',
        cause: error,
      });
    }
  });

export const getReportData = publicProcedure
  .input(z.object({
    timeRange: z.enum(['week', 'month', 'year'])
  }))
  .query(async ({ input }) => {
    const { timeRange } = input;
    
    const now = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const previousStartDate = new Date(startDate);
    switch (timeRange) {
      case 'week':
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      case 'month':
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
        break;
      case 'year':
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
        break;
    }

    const [
      currentInvoices,
      previousInvoices,
      activeUsers,
      previousActiveUsers,
      currentMilestones,
      previousMilestones,
      invoiceTrends,
      statusDistribution,
      milestoneProgress,
      userActivity
    ] = await Promise.all([
      prisma.invoice.count({
        where: { submission_date: { gte: startDate } }
      }),
      prisma.invoice.count({
        where: { 
          submission_date: { 
            gte: previousStartDate,
            lt: startDate 
          } 
        }
      }),
      prisma.user.count({
        where: { created_at: { gte: startDate } }
      }),
      prisma.user.count({
        where: { 
          created_at: { 
            gte: previousStartDate,
            lt: startDate 
          } 
        }
      }),
      prisma.milestone.count({
        where: { created_at: { gte: startDate } }
      }),
      prisma.milestone.count({
        where: { 
          created_at: { 
            gte: previousStartDate,
            lt: startDate 
          } 
        }
      }),
      prisma.invoice.groupBy({
        by: ['submission_date'],
        where: { submission_date: { gte: startDate } },
        _count: { id: true },
        _sum: { total_price: true },
        orderBy: { submission_date: 'asc' }
      }),
      prisma.invoice.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.milestone.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.user.groupBy({
        by: ['created_at'],
        where: { created_at: { gte: startDate } },
        _count: { id: true }
      })
    ]);

    const totalAmount = await prisma.invoice.aggregate({
      where: { submission_date: { gte: startDate } },
      _sum: { total_price: true }
    });

    const previousTotalAmount = await prisma.invoice.aggregate({
      where: { 
        submission_date: { 
          gte: previousStartDate,
          lt: startDate 
        } 
      },
      _sum: { total_price: true }
    });

    const calculateGrowth = (current: number, previous: number) => 
      previous === 0 ? 0 : ((current - previous) / previous) * 100;

    return {
      totalInvoices: currentInvoices,
      invoiceGrowth: calculateGrowth(currentInvoices, previousInvoices),
      activeUsers,
      userGrowth: calculateGrowth(activeUsers, previousActiveUsers),
      totalMilestones: currentMilestones,
      milestoneGrowth: calculateGrowth(currentMilestones, previousMilestones),
      totalAmount: totalAmount._sum.total_price || 0,
      amountGrowth: calculateGrowth(
        totalAmount._sum.total_price || 0,
        previousTotalAmount._sum.total_price || 0
      ),
      invoiceTrends: invoiceTrends.map(trend => ({
        date: trend.submission_date,
        amount: trend._sum.total_price || 0,
        count: trend._count.id
      })),
      statusDistribution: statusDistribution.map(status => ({
        name: status.status,
        value: status._count.id
      })),
      milestoneProgress: [
        {
          name: 'Milestones',
          completed: milestoneProgress.find(m => m.status === 'APPROVED')?._count.id || 0,
          pending: milestoneProgress.find(m => m.status === 'PENDING')?._count.id || 0
        }
      ],
      userActivity: userActivity.map(activity => ({
        date: activity.created_at,
        activeUsers: activity._count.id,
        newUsers: activity._count.id
      }))
    };
  });

  export const getFundingRequest = publicProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
    const {id} = input
    const fundingRequest = await prisma.fundingRequest.findUnique({where: {id}, include: {user: true, invoice: true}})
    return fundingRequest
  })

  export const getInvoice = publicProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
    const {id} = input
    const invoice = await prisma.invoice.findUnique({where: {id}, include: {user: true, vendor: true}})
    return invoice
  })

  export const getKYCDocument = publicProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
    const {id} = input
    const kycDocument = await prisma.kYCDocument.findUnique({where: {id}, include: {user: true}})
    return kycDocument
  })

  export const getMilestone = publicProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
    const {id} = input
    const milestone = await prisma.milestone.findUnique({where: {id}, include: {user: true, invoice: true}})
    return milestone
  })

export const getAllVendors = publicProcedure
  .input(
    z.object({
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("asc"),
    })
  )
  .query(async ({ input }) => {
    const { search, page, limit, sortBy, sortOrder } = input;
    const skip = (page - 1) * limit;
    const where: Prisma.VendorWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contact_person: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone_number: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.vendor.count({ where });

    // Build order by object
    const orderBy: Prisma.VendorOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { name: "asc" };

    // Get paginated and filtered vendors
    const vendors = await prisma.vendor.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    });

    return {
      data: vendors,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

export const updateVendor = publicProcedure.input(vendorSchema).mutation(async ({input}) => {
  const {vendor_id, ...data} = input
  const vendor = await prisma.vendor.update({where: {id: vendor_id}, data})
  return vendor
})

export const markNotificationAsRead = publicProcedure
  .input(z.object({ notification_id: z.string() }))
  .mutation(async ({ input }) => {
    const { notification_id } = input;

    const notification = await prisma.notification.update({
      where: { id: notification_id },
      data: { is_read: true },
    });

    return notification;
  });