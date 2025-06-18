import { render, screen, fireEvent } from '@testing-library/react';
import SearchComponent from '../components/SearchComponent';
import { BrowserRouter} from 'react-router-dom';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom',() => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


const setup =() => {
    return render(
      <BrowserRouter>
        <SearchComponent />
      </BrowserRouter>
    );
};

describe('SearchComponent UI & Logic',() =>{
  beforeEach(() =>{
    mockNavigate.mockClear(); // reset mock mỗi lần test 
  })


test('TC01: Hiển thị input và button', () =>{
  setup();
  expect(screen.getByPlaceholderText('Tìm kiếm sản phẩm...')).toBeInTheDocument();
  expect(screen.getByText('Tìm kiếm')).toBeInTheDocument();
});

test('TC02: Nhập từ khóa nhấn Enter gọi navigate đúng', () =>{
  setup();
  const input = screen.getByPlaceholderText('Tìm kiếm sản phẩm...');
  fireEvent.change(input, { target: { value: 'áo thun'}});
  fireEvent.submit(input); //submit form nhấn Enter

  expect(mockNavigate).toHaveBeenCalledWith('/search?q=%C3%A1o%20thun');
});

test('TC03: nhập từ khóa nhấn nút tìm kiếm gọi navigate',() =>{
  setup();
  const input = screen.getByPlaceholderText('Tìm kiếm sản phẩm...');
  fireEvent.change(input, {target: { value: 'giày'}});

  fireEvent.click(screen.getByText('Tìm kiếm'));
  expect(mockNavigate).toHaveBeenCalledWith('/search?q=gi%C3%A0y');
});

test('TC04: Không nhập gì, không gọi navigate',() =>{
  setup();
  fireEvent.click(screen.getByText('Tìm kiếm'));
  expect(mockNavigate).not.toHaveBeenCalled();
});

test('TC05: Nhập toàn dấu cách, không họi navigate',() =>{
  setup();
  const input = screen.getByPlaceholderText('Tìm kiếm sản phẩm...');
  fireEvent.change(input, { target: { value: '   ' } });
  fireEvent.click(screen.getByText('Tìm kiếm'));

  expect(mockNavigate).not.toHaveBeenCalled();
});

test('TC06: Nhập ký tự đặc biệt', () =>{
  setup();
  const input = screen.getByPlaceholderText('Tìm kiếm sản phẩm...');
  fireEvent.change(input, { target: { value: '@#$$%' } });
  fireEvent.click(screen.getByText('Tìm kiếm'));

  expect(mockNavigate).toHaveBeenCalledWith('/search?q=%40%23%24%24%25');
});

test('TC07: Nhập chuỗi dài có dấu -> encode đúng', () => {
    setup();
    const input = screen.getByPlaceholderText('Tìm kiếm sản phẩm...');
    fireEvent.change(input, { target: { value: 'áo sơ mi' } });
    fireEvent.click(screen.getByText('Tìm kiếm'));

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=%C3%A1o%20s%C6%A1%20mi');
});

});