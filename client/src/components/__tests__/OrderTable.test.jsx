import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import OrderTable from '../OrderTable'

// Mock the orderAPI
vi.mock('../../api/orderAPI', () => ({
  fetchOrders: vi.fn()
}))

// Mock react-router-dom
const MockRouter = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('OrderTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(
      <MockRouter>
        <OrderTable />
      </MockRouter>
    )
    
    // 检查加载动画是否存在
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders orders table when data is loaded', async () => {
    const mockResponse = {
      success: true,
      data: {
        orders: [
          {
            id: 1,
            customerName: '张三',
            totalAmount: 299.99,
            status: 'completed'
          },
          {
            id: 2,
            customerName: '李四',
            totalAmount: 199.99,
            status: 'pending'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      }
    }

    const { fetchOrders } = await import('../../api/orderAPI')
    fetchOrders.mockResolvedValue(mockResponse)

    render(
      <MockRouter>
        <OrderTable />
      </MockRouter>
    )

    await waitFor(() => {
      // 检查表格中是否有订单数据
      expect(screen.getAllByText('未知客户')).toHaveLength(2)
      expect(screen.getByText('¥299.99')).toBeInTheDocument()
      expect(screen.getByText('¥199.99')).toBeInTheDocument()
    })
  })

  it('displays correct status badges', async () => {
    const mockResponse = {
      success: true,
      data: {
        orders: [
          {
            id: 1,
            customerName: '张三',
            totalAmount: 299.99,
            status: 'completed'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        }
      }
    }

    const { fetchOrders } = await import('../../api/orderAPI')
    fetchOrders.mockResolvedValue(mockResponse)

    render(
      <MockRouter>
        <OrderTable />
      </MockRouter>
    )

    await waitFor(() => {
      // 查找表格中的状态徽章，而不是筛选器中的选项
      const statusBadges = screen.getAllByText('已完成')
      const tableBadge = statusBadges.find(badge => 
        badge.closest('tbody') !== null
      )
      expect(tableBadge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200')
    })
  })

  it('handles API errors gracefully', async () => {
    const { fetchOrders } = await import('../../api/orderAPI')
    fetchOrders.mockRejectedValue(new Error('API Error'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MockRouter>
        <OrderTable />
      </MockRouter>
    )

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('获取订单失败:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})
