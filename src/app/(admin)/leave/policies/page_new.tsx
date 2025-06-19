"use client";

import React from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';

const LeavePoliciesPage = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Leave Policies" />
      
      {/* Header Section */}
      <ComponentCard title="🇯🇴 Leave Policies – Jordan Labor Law Compliance">
        <div className="space-y-6">
          {/* General Policies */}
          <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              General Leave Policies
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                All leave requests must be submitted through the HRMS system.
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Approval depends on business needs and staffing levels.
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                False claims or leave misuse may result in disciplinary action.
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Employees should plan leave in advance to ensure workflow continuity.
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Leave balances reset annually on January 1st unless stated otherwise.
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Part-time employees receive pro-rated leave based on working hours.
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Leave cannot be exchanged for cash unless allowed by law (e.g., upon termination).
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Emergency leave may be granted at management discretion.
              </li>
            </ul>
          </div>
        </div>
      </ComponentCard>

      {/* Annual Leave */}
      <div className="mt-6">
        <ComponentCard title="🏖️ Annual (Vacation) Leave">
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Allocation:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <strong>14 working days</strong> per year for employees with &lt;5 years of service
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <strong>21 working days</strong> per year for employees with ≥5 years of service
                </li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                (Jordan Labor Law Article 61)
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Rules & Guidelines:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Must be requested at least 7 days in advance.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  May be divided based on employee request and employer consent.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Can be carried forward to the next year if not used due to employer needs.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Unused leave is compensated in case of resignation or termination.
                </li>
              </ul>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Sick Leave */}
      <div className="mt-6">
        <ComponentCard title="🤒 Sick Leave">
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Allocation:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <strong>14 days</strong> per year with full pay (must be supported by a medical report).
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Additional <strong>14 days</strong> at half pay if illness continues and is verified by an official medical committee.
                </li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                (Article 65)
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Rules & Guidelines:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Medical certificate required for absences longer than 1 day.
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Can be used for employee's own health needs.
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Emergency illness requires notifying the supervisor same day or as soon as possible.
                </li>
              </ul>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Maternity Leave */}
      <div className="mt-6">
        <ComponentCard title="🧑‍🍼 Maternity Leave">
          <div className="space-y-4">
            <div className="bg-pink-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Allocation:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <strong>10 weeks (70 days)</strong> fully paid leave.
                </li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                (Article 67)
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Rules & Guidelines:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Available after 180 days of employment.
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Cannot be split.
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Includes pre- and post-delivery period.
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Entitled to 1 hour/day for nursing for 1 year after childbirth.
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Job protection guaranteed.
                </li>
              </ul>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Paternity Leave */}
      <div className="mt-6">
        <ComponentCard title="👨‍👧 Paternity Leave">
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Allocation:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <strong>3 days</strong>, paid leave.
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Rules & Guidelines:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Must be taken within 15 days of birth.
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Proof of birth required.
                </li>
              </ul>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Bereavement Leave */}
      <div className="mt-6">
        <ComponentCard title="💔 Bereavement Leave">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Allocation:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <strong>3 days</strong> per occurrence (paid).
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Rules & Guidelines:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  Applies to death of spouse, children, parents, or siblings.
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  May be extended with unpaid leave upon management approval.
                </li>
              </ul>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Personal/Emergency Leave */}
      <div className="mt-6">
        <ComponentCard title="👤 Personal / Emergency Leave">
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Allocation:</h4>
              <p className="text-gray-700 dark:text-gray-300">
                Based on employer discretion (not mandated by law)
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Suggested Internal Policy:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Up to <strong>5 unpaid days</strong> per year for personal reasons.
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Must be requested in advance and approved by management.
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Cannot be combined with other leave types.
                </li>
              </ul>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Footer Note */}
      <div className="mt-6">
        <div className="bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Important Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  These policies are based on Jordan Labor Law. For specific situations not covered here, 
                  please consult with HR or refer to the official labor law documentation. 
                  Policies may be updated to reflect changes in legislation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavePoliciesPage;
