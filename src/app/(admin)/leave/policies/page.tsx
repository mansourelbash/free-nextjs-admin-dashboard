"use client";

import React from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';

const LeavePoliciesPage = () => {
  const generalPolicies = [
    'All leave requests must be submitted through the HRMS system.',
    'Approval depends on business needs and staffing levels.',
    'False claims or leave misuse may result in disciplinary action.',
    'Employees should plan leave in advance to ensure workflow continuity.',
    'Leave balances reset annually on January 1st unless stated otherwise.',
    'Part-time employees receive pro-rated leave based on working hours.',
    'Leave cannot be exchanged for cash unless allowed by law (e.g., upon termination).',
    'Emergency leave may be granted at management discretion.'
  ];

  const leaveTypes = [
    {
      id: 'annual-leave',
      emoji: '🏖️',
      type: 'Annual (Vacation) Leave',
      allocation: '14 days per year (<5 years service) / 21 days per year (≥5 years service)',
      description: 'Paid vacation time as per Jordan Labor Law Article 61',
      rules: [
        'Must be requested at least 7 days in advance.',
        'May be divided based on employee request and employer consent.',
        'Can be carried forward to the next year if not used due to employer needs.',
        'Unused leave is compensated in case of resignation or termination.'
      ]
    },
    {
      id: 'sick-leave',
      emoji: '🤒',
      type: 'Sick Leave',
      allocation: '14 days full pay + 14 days half pay (if needed)',
      description: 'Medical leave as per Jordan Labor Law Article 65',
      rules: [
        'Medical certificate required for absences longer than 1 day.',
        'Can be used for employee health needs.',
        'Emergency illness requires notifying supervisor same day or ASAP.',
        'Additional 14 days at half pay if illness continues (verified by medical committee).'
      ]
    },
    {
      id: 'maternity-leave',
      emoji: '🧑‍🍼',
      type: 'Maternity Leave',
      allocation: '10 weeks (70 days) fully paid',
      description: 'Maternity leave as per Jordan Labor Law Article 67',
      rules: [
        'Available after 180 days of employment.',
        'Cannot be split.',
        'Includes pre- and post-delivery period.',
        'Entitled to 1 hour/day for nursing for 1 year after childbirth.',
        'Job protection guaranteed.'
      ]
    },
    {
      id: 'paternity-leave',
      emoji: '👨‍👧',
      type: 'Paternity Leave',
      allocation: '3 days, paid leave',
      description: 'Leave for new fathers',
      rules: [
        'Must be taken within 15 days of birth.',
        'Proof of birth required.'
      ]
    },
    {
      id: 'bereavement-leave',
      emoji: '💔',
      type: 'Bereavement Leave',
      allocation: '3 days per occurrence (paid)',
      description: 'Leave for loss of immediate family members',
      rules: [
        'Applies to death of spouse, children, parents, or siblings.',
        'May be extended with unpaid leave upon management approval.'
      ]
    },
    {
      id: 'personal-leave',
      emoji: '👤',
      type: 'Personal / Emergency Leave',
      allocation: 'Up to 5 unpaid days per year (discretionary)',
      description: 'Personal leave based on employer discretion',
      rules: [
        'Must be requested in advance and approved by management.',
        'Cannot be combined with other leave types.',
        'Based on employer discretion (not mandated by law).'
      ]
    }
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Leave Policies" />
      
      {/* Header */}
      <div className="mb-6">
        <ComponentCard title="🇯🇴 Leave Policies – Jordan Labor Law Compliance">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              Our leave policies comply with Jordan Labor Law requirements and provide additional benefits where applicable.
            </p>
          </div>
        </ComponentCard>
      </div>
      
      {/* General Policies */}
      <ComponentCard title="General Leave Policies">
        <div className="space-y-3">
          {generalPolicies.map((policy, index) => (
            <div key={`policy-${index}`} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-gray-700 dark:text-gray-300">{policy}</p>
            </div>
          ))}
        </div>
      </ComponentCard>

      {/* Leave Types */}
      <div className="mt-6 space-y-6">
        {leaveTypes.map((leave) => (
          <ComponentCard key={leave.id} title={`${leave.emoji} ${leave.type}`}>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Allocation: {leave.allocation}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 font-medium">{leave.description}</p>
              
              <div>
                <h4 className="font-medium text-black dark:text-white mb-3">Rules & Guidelines:</h4>
                <div className="space-y-2">
                  {leave.rules.map((rule, ruleIndex) => (
                    <div key={`${leave.id}-rule-${ruleIndex}`} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ComponentCard>
        ))}
      </div>

      {/* Legal Reference */}
      <div className="mt-6">
        <ComponentCard title="📋 Legal References">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Jordan Labor Law References:</h4>
            <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              <li>• Article 61: Annual Leave Entitlements</li>
              <li>• Article 65: Sick Leave Provisions</li>
              <li>• Article 67: Maternity Leave Rights</li>
            </ul>
          </div>
        </ComponentCard>
      </div>

      {/* Contact Information */}
      <div className="mt-6">
        <ComponentCard title="📞 Need Help?">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              For questions about leave policies or to request special accommodations, please contact:
            </p>
            <div className="space-y-1">
              <p className="text-sm font-medium text-black dark:text-white">HR Department</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email: hr@company.com</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Phone: (555) 123-4567</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Office Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default LeavePoliciesPage;
