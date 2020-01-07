import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Message from './Message'
import Adapter from 'enzyme-adapter-react-16'
import 'jest-enzyme';

Enzyme.configure({ adapter: new Adapter() })

describe('String prop?', () => {
    test('string prop', () => {
        const wrapper = mount(<Message textResponse="Message" text={{text: {valid: true}}} />)

        expect(wrapper.props().textResponse).toBe("Message");
    })
})
