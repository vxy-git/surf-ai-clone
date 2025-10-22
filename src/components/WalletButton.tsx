"use client";

import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useTranslation } from "@/hooks/useTranslation"
import { useWeb3ModalInitialized } from "@/contexts/WalletContext"
import { useState, useEffect, useRef } from 'react'

export default function WalletButton() {
  const { t } = useTranslation()
  const { initialized } = useWeb3ModalInitialized()

  // 如果未初始化,显示占位按钮
  if (!initialized) {
    return (
      <button
        disabled
        className="px-4 md:px-6 py-2 border-2 border-gray-300 text-gray-400 rounded-full font-medium text-sm md:text-base cursor-not-allowed opacity-50"
      >
        {t("connectWallet")}
      </button>
    )
  }

  // 初始化完成后才调用 useWeb3Modal
  return <WalletButtonInner />
}

function WalletButtonInner() {
  const { t } = useTranslation()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 获取钱包余额
  const { data: balance } = useBalance({
    address: address,
  })

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 格式化地址: 0x1234...5678
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // 格式化余额
  const formatBalance = () => {
    if (!balance) return '0.0000'
    const value = Number(balance.formatted)
    return value.toFixed(4)
  }

  // 未连接时显示连接按钮
  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="px-4 md:px-6 py-2 border-2 border-[#de5586] text-[#de5586] rounded-full font-medium hover:bg-[#de5586] hover:text-white transition-colors text-sm md:text-base"
      >
        {t("connectWallet")}
      </button>
    )
  }

  // 已连接时显示钱包信息和下拉菜单
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 md:px-6 py-2 bg-gradient-to-r from-[#de5586] to-[#de99a7] text-white rounded-full font-medium hover:shadow-lg transition-all text-sm md:text-base"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="hidden sm:inline">{formatAddress(address!)}</span>
        <span className="sm:hidden">{address!.slice(0, 4)}...{address!.slice(-3)}</span>
        <svg
          className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden z-50">
          {/* 钱包信息 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("walletAddress")}</div>
            <div className="font-mono text-sm font-medium mb-3">{formatAddress(address!)}</div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("balance")}</div>
            <div className="text-lg font-bold">
              {formatBalance()} <span className="text-sm font-normal text-gray-600 dark:text-gray-400">BNB</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="p-2">
            <button
              onClick={() => {
                open()
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{t("changeNetwork")}</span>
            </button>

            <button
              onClick={() => {
                disconnect()
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>{t("disconnect")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
