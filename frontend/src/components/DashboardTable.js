import { useEffect, useState } from "react";
import { Table, Pagination, Input, Select } from "antd";
import { BiSearch } from 'react-icons/bi';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HOST } from "../utils/constants";
import useToken from "../utils/useToken";
import editIcon from "../assets/editIcon.svg";
import deleteIcon from "../assets/deleteIcon.svg";
import preview from "../assets/preview.svg";
import share from "../assets/share.svg";
import edit from "../assets/edit.svg";
import DeleteAlert from "./DeleteAlert";
import Preview from "./Preview";
import InteractiveListView from "./InteractiveListView";
import ShareModal from "./ShareModal";


const DashboardTable = () => {
  const [spreadsheet, setSpreadSheet] = useState([]);
  const [filteredSheets, setFilteredSheets] = useState([]); // To store the filtered data
  const [searchQuery, setSearchQuery] = useState(""); // To store the search query
  const [loading, setLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default page size
  const token = useToken();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sheetData, setSheetData] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [spreadsheetIdForShare, setSpreadsheetIdForShare] = useState(null);
  const [sheetSharedWith, setSheetSharedWith] = useState(null);



  useEffect(() => {
    axios
      .post(
        `${HOST}/getSpreadSheets`,
        {},
        {
          headers: {
            authorization: "Bearer " + token,
          },
        }
      )
      .then(({ data: res }) => {
        if (res.error) {
          alert(res.error);
          navigate("/");
          return;
        }
        setSpreadSheet(res);
        setFilteredSheets(res); // Initially, filteredSheets is the same as spreadsheet
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  const handleShare = (spreadsheetId,sharedWith) => {
    console.log("sharedWith",sharedWith);
    setSpreadsheetIdForShare(spreadsheetId); // Set the selected spreadsheetId
    setShowModal(true); // Open the modal
    setSheetSharedWith(sharedWith);
  };


  // Function to handle search input
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filteredData = spreadsheet.filter((sheet) => {
      const sheetName = sheet.spreadsheetName || sheet.firstSheetName;
      return sheetName.toLowerCase().includes(query);
    });

    setFilteredSheets(filteredData);
  };

  const handleEdit = (id) => {
    navigate(`/${id}/edit`);
  };

  // Function to open the modal
  const openModal = (sheetData) => {
    setIsModalOpen(true);
    setSheetData(sheetData);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id, sheetName) => {
    setSheetToDelete({ id, sheetName });
    setConfirmModalOpen(true);
  };

  const handleDelete = () => {
    if (!sheetToDelete) return;

    axios
      .delete(`${HOST}/deleteSpreadsheet/${sheetToDelete.id}`, {
        headers: {
          authorization: "Bearer " + token,
        },
      })
      .then(({ data }) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setSpreadSheet((prevSpreadsheets) =>
          prevSpreadsheets.filter((sheet) => sheet._id !== sheetToDelete.id)
        );
        setFilteredSheets((prevFilteredSheets) =>
          prevFilteredSheets.filter((sheet) => sheet._id !== sheetToDelete.id)
        );
        setConfirmModalOpen(false);
      })
      .catch((err) => {
        console.log(err.message);
        setConfirmModalOpen(false);
      });
  };

  const handleDeleteCancel = () => {
    setConfirmModalOpen(false);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };


  const tableData = filteredSheets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <div className="overflow-x-auto m-4 rounded-[10.423px] border-[1.303px] border-[#FFF7EA] bg-[#FEFBF7] overflow-hidden">
        <div className="w-[100%] border-b-[1.303px]">
          <div className="flex w-1/3 gap-[10px] justify-start p-4 relative z-[100]">
            {/* Search input */}
            <div className="flex flex-1">
              <Input
                prefix={<BiSearch />}
                value={searchQuery}
                onChange={handleSearch}
                style={{ width: "200px" }}
                className="min-w-[150px]"
                placeholder="Search by Spreadsheet Name"
              />
            </div>
            <div className="flex">
              <Select
                defaultValue={"Select App Name"}
                style={{ width: "200px" }}
                className="w-full"
                size="large"
                options={[
                  { value: '', label: 'Select App Name', disabled: true },
                  { value: 'Interactive List', label: 'Interactive List' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="max-h-[400px] overflow-auto">
          <table className="min-w-full table-fixed">
            <thead className="sticky top-0 bg-[#FEFBF7] z-10">
              <tr className="border-b-[1.303px] border-[#EAECF0]">
                <th className="w-1/2 p-4 text-start text-[#101828] font-poppins text-[24px] font-semibold leading-[23.452px]">
                  Active Spreadsheet
                </th>
                <th className="w-1/6 p-4 text-start text-[#667085] font-poppins text-[20px] font-semibold leading-[23.452px]">
                  Access
                </th>
                <th className="w-1/6 p-4 text-start text-[#667085] font-poppins text-[20px] font-semibold leading-[23.452px]">
                  Last Update
                </th>
                <th className="w-1/6 p-4 text-start text-[#667085] font-poppins text-[20px] font-semibold leading-[23.452px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((sheet, index) => (
                <tr key={sheet._id} className="border-b-[1.303px] border-[#EAECF0]">
                  <td className="px-4 py-2">
                    <a onClick={() => handleEdit(sheet._id)}
                      class="text-[#437FFF] font-poppins text-[14px] font-normal leading-[26px] underline cursor-pointer">
                      {sheet.spreadsheetName || sheet.firstSheetName}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-[14px]">Owner</td>
                  <td className="px-4 py-2 text-[14px]">06/20/2024</td>
                  <td className="px-4 py-2 flex gap-[15px] justify-start items-center">
                    <button onClick={() => openModal(sheet)} className="relative">
                      <div class="group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="stroke-current group-hover:stroke-orange-500">
                          <path d="M1.71615 10.2898C1.6467 10.1027 1.6467 9.89691 1.71615 9.70981C2.39257 8.06969 3.54075 6.66735 5.01513 5.68056C6.48951 4.69378 8.22369 4.16699 9.99782 4.16699C11.7719 4.16699 13.5061 4.69378 14.9805 5.68056C16.4549 6.66735 17.6031 8.06969 18.2795 9.70981C18.3489 9.89691 18.3489 10.1027 18.2795 10.2898C17.6031 11.9299 16.4549 13.3323 14.9805 14.3191C13.5061 15.3058 11.7719 15.8326 9.99782 15.8326C8.22369 15.8326 6.48951 15.3058 5.01513 14.3191C3.54075 13.3323 2.39257 11.9299 1.71615 10.2898Z" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                    </button>

                    <button onClick={() => handleEdit(sheet._id)}>
                      <div class="group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="group-hover:stroke-orange-500">
                          <g clip-path="url(#clip0_508_940)">
                            <path d="M17.6462 5.67633C18.0868 5.23585 18.3344 4.63839 18.3345 4.01538C18.3346 3.39237 18.0871 2.79484 17.6467 2.35425C17.2062 1.91366 16.6087 1.66609 15.9857 1.66602C15.3627 1.66594 14.7652 1.91335 14.3246 2.35383L3.20291 13.478C3.00943 13.6709 2.86634 13.9084 2.78625 14.1697L1.68541 17.7963C1.66388 17.8684 1.66225 17.945 1.68071 18.0179C1.69916 18.0908 1.73701 18.1574 1.79024 18.2105C1.84347 18.2636 1.9101 18.3014 1.98305 18.3197C2.05599 18.3381 2.13255 18.3363 2.20458 18.3147L5.83208 17.2147C6.09306 17.1353 6.33056 16.9931 6.52375 16.8005L17.6462 5.67633Z" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12.5 4.16602L15.8333 7.49935" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                          </g>
                          <defs>
                            <clipPath id="clip0_508_940">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </button>

                    <button onClick={() => handleDeleteClick(sheet._id, sheet.spreadsheetName || sheet.firstSheetName)}>
                      <div class="group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="group-hover:stroke-orange-500">
                          <path d="M2.5 5H17.5" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M15.8346 5V16.6667C15.8346 17.5 15.0013 18.3333 14.168 18.3333H5.83464C5.0013 18.3333 4.16797 17.5 4.16797 16.6667V5" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M6.66797 4.99935V3.33268C6.66797 2.49935 7.5013 1.66602 8.33464 1.66602H11.668C12.5013 1.66602 13.3346 2.49935 13.3346 3.33268V4.99935" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M8.33203 9.16602V14.166" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M11.668 9.16602V14.166" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                    </button>

                    <button onClick={() => handleShare(sheet._id, sheet.sharedWith)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="group-hover:stroke-orange-500">
                        <path d="M15 6.66602C16.3807 6.66602 17.5 5.54673 17.5 4.16602C17.5 2.7853 16.3807 1.66602 15 1.66602C13.6193 1.66602 12.5 2.7853 12.5 4.16602C12.5 5.54673 13.6193 6.66602 15 6.66602Z" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M5 12.5C6.38071 12.5 7.5 11.3807 7.5 10C7.5 8.61929 6.38071 7.5 5 7.5C3.61929 7.5 2.5 8.61929 2.5 10C2.5 11.3807 3.61929 12.5 5 12.5Z" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M15 18.333C16.3807 18.333 17.5 17.2137 17.5 15.833C17.5 14.4523 16.3807 13.333 15 13.333C13.6193 13.333 12.5 14.4523 12.5 15.833C12.5 17.2137 13.6193 18.333 15 18.333Z" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M7.15625 11.2578L12.8479 14.5745" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M12.8396 5.4248L7.15625 8.74147" stroke="#919191" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>

                  </td>
                </tr>
              ))}
              <DeleteAlert
                isOpen={confirmModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDelete}
                sheetName={sheetToDelete?.sheetName}
              />
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <Preview closeModal={closeModal} sheetdetails={sheetData} />
        )}

        <ShareModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          spreadsheetId={spreadsheetIdForShare}
          sharedWith={sheetSharedWith}
        />


        <div className="p-4 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredSheets.length}
            onChange={handlePageChange}
            showSizeChanger
          />
        </div>
      </div>
    </>
  );
};

export default DashboardTable;