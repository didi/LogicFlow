import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../App.vue'
import router from '../router'

describe('App menu', () => {
  function mountApp() {
    return mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<main />' },
          'el-icon': { template: '<i><slot /></i>' },
          'el-menu': {
            props: ['collapse'],
            template: '<nav :data-collapse="String(collapse)"><slot /></nav>'
          },
          'el-menu-item': {
            props: ['index', 'title'],
            template: '<a :data-index="index" :title="title"><slot /><slot name="title" /></a>'
          }
        }
      }
    })
  }

  it('keeps menu items available in collapsed mode and can expand labels', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    const wrapper = mountApp()

    expect(wrapper.find('header').classes()).toContain('collapsed')
    expect(wrapper.find('nav').attributes('data-collapse')).toBe('true')
    expect(wrapper.text()).toContain('展开菜单')
    expect(wrapper.find('[data-index="/pool-lane-workbench"]').attributes('title')).toBe(
      'Pool/Lane/DynamicGroup Workbench'
    )

    await wrapper.find('.menu-toggle').trigger('click')
    await nextTick()

    expect(wrapper.find('header').classes()).not.toContain('collapsed')
    expect(wrapper.find('nav').attributes('data-collapse')).toBe('false')
    expect(wrapper.text()).toContain('收起菜单')
    expect(wrapper.text()).toContain('Pool/Lane/DynamicGroup Workbench')
    expect(wrapper.text()).not.toContain('Pool + Group')
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'resize' }))

    dispatchSpy.mockRestore()
  })

  it('removes the pool group conflict route entry', () => {
    expect(router.getRoutes().some((route) => route.path === '/pool-group-conflict')).toBe(false)
  })
})
