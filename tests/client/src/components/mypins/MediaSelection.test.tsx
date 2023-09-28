import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { MediaSelect, MediaButtonHandler } from '../../../../../client/src/components/mypins/MediaSelection';

describe('Selecting media', () => {
  test('will display the media selection toggle buttons', () => {
    const wrapper = shallow(<MediaSelect mediaType="link" handleMediaChange={jest.fn()} totalAiGenratedImages={2} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});

describe('Handling different media buttons -', () => {
  let props: React.ComponentProps<typeof MediaButtonHandler>;
  beforeEach(() => {
    props = {
      mediaType: 'link',
      isError: false,
      picPreview: '',
      description: 'stub description',
      totalAiGenratedImages: 2,
      AIimageStatus: {
        generatedImage: false,
        generatingImage: false,
        _id: null,
      },
      handleLinkImage: jest.fn(),
      handleUploadedImage: jest.fn(),
      handleAIimage: jest.fn(),
      showAIResetDialog: jest.fn(),
    };
  });
  test('links', () => {
    const wrapper = shallow(<MediaButtonHandler {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  test('uploads - with no error', () => {
    props = { ...props, mediaType: 'upload' };
    const wrapper = shallow(<MediaButtonHandler {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  test('uploads with error', () => {
    props = { ...props, mediaType: 'upload', isError: true };
    const wrapper = shallow(<MediaButtonHandler {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  test('AI - not generated yet', () => {
    props = { ...props, mediaType: 'AI' };
    const wrapper = shallow(<MediaButtonHandler {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  test('AI - generated ', () => {
    props = {
      ...props,
      mediaType: 'AI',
      AIimageStatus: {
        generatedImage: true,
        generatingImage: false,
        _id: null,
      },
    };
    const wrapper = shallow(<MediaButtonHandler {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
