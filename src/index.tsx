import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { DocumentEditorContainerComponent, Ribbon } from '@syncfusion/ej2-react-documenteditor';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ListView } from '@syncfusion/ej2-react-lists';
import { coverPage, aboutAuthor, cSharpIntro, summaryPage } from "./file-data";
import { TitleBar } from './title-bar';
import { listData } from './list-data';
import './index.css';

DocumentEditorContainerComponent.Inject(Ribbon);

const DragDropDocument = () => {
    useEffect(() => {
        // Initialize after first render to wire up title bar and editor defaults
        setTimeout(() => initContainer(), 0);
    }, []);
    const dialogRef = useRef<DialogComponent>(null);
    const viewContainerRef = useRef<DocumentEditorContainerComponent>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    let hostUrl = "https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/";
    let titleBar: TitleBar | null = null;

    let containerRef = useRef<DocumentEditorContainerComponent>(null);
    
    const [dictionary, setDictionary] = useState({
        'Cover Page' : coverPage,
        'About Author' : aboutAuthor,
        'C-Sharp Intro': cSharpIntro,
        'Summary Page' : summaryPage
    });
    
    const onCreate = () => {
        if(containerRef.current){
            containerRef.current.documentEditor.documentName = "Drag and Drop Document";
            document.getElementById("listView").addEventListener("dragstart", (event) => {
                event.dataTransfer.setData("Text", event.target.innerText);
                event.target.classList.add("de-drag-target");
            });
            // Prevent default drag over for document editor element
            document.getElementById("container").addEventListener("dragover", (event) => {
                event.preventDefault();
            });
            // Drop Event for document editor element
            document.getElementById("container").addEventListener("drop", (e) => {
                let fragmentName = e.dataTransfer.getData("Text");
                containerRef.current.documentEditor.selection.select({
                    x: e.offsetX,
                    y: e.offsetY,
                    extend: false,
                });
                pasteSfdt(fragmentName);
            });
            document.addEventListener("dragend", (event) => {
                if (event.target.classList.contains("de-drag-target")) {
                    event.target.classList.remove("de-drag-target");
                }
            });
            
            
            const onSelect = (args) => {
                let fragmentName = args.text;
                listView.selectItem(undefined);
                pasteSfdt(fragmentName);
            };

            
            
            let listView = new ListView({
                dataSource: listData,

                template: `
                    <div class="doc-row" style="display:flex;align-items:center;width:100%;">
                        <span class="doc-title" style="flex:1">\${text}</span>
                        <button type="button" class="e-de-view-btn" data-id="\${id}" title="View" arial-label="View">
                        <span class="e-icons e-eye"></span>
                        </button>
                    </div>
                `,
                select: onSelect.bind(this)
            });
            let listDivElement = document.getElementById("listView");
            listView.appendTo(listDivElement);
            
            listDivElement?.addEventListener("click", (e) => {

                const button = (e.target as HTMLElement).closest(".e-de-view-btn");

                if (button) {
                    e.stopPropagation();
					e.originalEvent?.stopPropagation();
                    e.preventDefault();
                    const id = button.getAttribute("data-id");
                    const row = listData.find(x => x.id.toString() === id);

                    if (row) {
                        openDoc("View", row.text);
                    }
                }            
            });
        }
        
    };

    function initContainer() {
        if (!viewContainerRef.current)
            return;
        const editor = viewContainerRef.current.documentEditor;
        // Title bar hookup
        titleBar = new TitleBar(document.getElementById("documenteditor_titlebar"), editor, true, false, dialogRef.current);
        // Basic defaults
        editor.pageOutline = '#E0E0E0';
        editor.acceptTab = true;
        viewContainerRef.current.documentEditorSettings.showRuler = true;
        // Keep title updated
        viewContainerRef.current.documentChange = () => {
            titleBar?.updateDocumentTitle();
            editor.focusIn();
        };
        viewContainerRef.current.resize();
    }
    
    function dialogOpen() {
        setDialogOpen(true);
        // Ensure sizing is correct when dialog is visible
        setTimeout(() => viewContainerRef.current.documentEditor?.resize(), 0);
    }

    function dialogClose() {
        setDialogOpen(false);
    }

    function openDoc(mode, fragmentName) {
        if (!viewContainerRef.current)
            return;
        dialogOpen();
        const editor = viewContainerRef.current.documentEditor;
        if (dictionary.hasOwnProperty(fragmentName)) {
            editor.open(JSON.stringify(dictionary[fragmentName]));
        }
        if (mode === 'View') {
            editor.isReadOnly = true;
            editor.enableContextMenu = false;
            // Hide "Share" button if available, show close button in title-bar
            const downloadButton = document.getElementById('documenteditor-share');
            if (downloadButton)
                downloadButton.style.display = 'none';
            const closeButton = document.getElementById('de-close');
            if (closeButton)
                closeButton.style.display = 'block';
            editor.documentName = fragmentName;
            const titleEl = document.getElementById('documenteditor_title_name');
            if (titleEl)
                titleEl.textContent = editor.documentName;            
        }
        else {
           
        }
        viewContainerRef.current.resize();
    }
    
    const pasteSfdt = (fragmentName) => {
        containerRef.current.documentEditor.editor.paste(dictionary[fragmentName]);
        containerRef.current.documentEditor.focusIn();
    };
    
    return (
        <div className="control-pane">
            <div className="control-section" style={{  display: "flex" }}>
                <div className="list-section" style={{ width: "20%", position: "relative", paddingRight: "15px", paddingLeft: "5px",
                paddingTop: "0px", height: "590px", borderLeft: "1px solid rgb(238, 238, 238)", borderBottom: "1px solid rgb(238, 238, 238)"}}>
                    <h5>
                        <label style={{ display: "block", margin: "1px", paddingTop: "5px" }}>
                            Select or Drag and Drop the fragment to Insert
                        </label>
                    </h5>
                    <div id="listView"></div>
                </div>
                <div className="control-section" style={{  width: "80%", position: "relative", paddingRight: "15px", paddingLeft: "15px" }}>
                    <DocumentEditorContainerComponent id="container" ref={containerRef} style={{ display: "block" }} height='880px'
                    serviceUrl={hostUrl} enableToolbar={true} toolbarMode='Ribbon' locale="en-US" created={onCreate}/>
                </div>
            </div>

            {/* <div className="overlay" id="popup-overlay"></div>
            <div id="waiting-popup">
                <svg className="circular" height="40" width="40">
                    <circle className="circle-path" cx="25" cy="25" r="20" fill="none" strokeWidth="6" strokeMiterlimit="10"/>
                </svg>
            </div> */}

            <DialogComponent id="defaultDialog" visible={isDialogOpen} minHeight={'90%'} width={'90%'} height={'90%'} isModal={true} ref={dialogRef} open={dialogOpen} close={dialogClose}>
                <div>
                <div id="documenteditor_titlebar" className="e-de-ctn-title" style={{ display: "flow-root" }}></div>
                <div id="documenteditor_container_body">
                    <DocumentEditorContainerComponent showPropertiesPane={false} id="viewContainer" height='780px' ref={viewContainerRef} style={{ display: "block" }} serviceUrl={hostUrl} zIndex={3000} enableToolbar={false} locale="en-US"/>
                </div>
                </div>
            </DialogComponent>
        </div>
    );
};
export default DragDropDocument;
createRoot(document.getElementById('sample')).render(<DragDropDocument />);
