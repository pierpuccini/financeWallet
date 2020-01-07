import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import App from './App'
import Adapter from 'enzyme-adapter-react-16'
import 'jest-enzyme';

Enzyme.configure({ adapter: new Adapter() })

describe('App renders?', () => {
    test('renders', () => {
        const wrapper = shallow(<App />)

        expect(wrapper.exists()).toBe(true)
    })
})
