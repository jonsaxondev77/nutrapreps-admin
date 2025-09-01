import { NextResponse } from 'next/server';

const API_STORAGE_KEY = process.env.BUNNY_CDN_STORAGE_API_KEY;
const STORAGE_ZONE_NAME = process.env.BUNNY_CDN_STORAGE_ZONE_NAME;
const CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_PULL_ZONE_HOSTNAME;

export async function GET(request: Request) {
    if (!API_STORAGE_KEY || !STORAGE_ZONE_NAME || !CDN_HOSTNAME) {
        return NextResponse.json({ error: 'CDN configuration missing' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const rawPath = searchParams.get('path') || '/';
        const apiPath = rawPath === '/' ? '' : rawPath.replace(/^\//, '');

        const response = await fetch(
            `https://uk.storage.bunnycdn.com/${STORAGE_ZONE_NAME}/${apiPath}`,
            {
                method: 'GET',
                headers: {
                    'AccessKey': API_STORAGE_KEY!,
                    'accept': 'application/json'
                },
            }
        );

        if (!response.ok) {
            console.error('BunnyCDN API error:', response.status, response.statusText);
            throw new Error(`API error: ${response.status}`);
        }

        const files = await response.json();
        
        const processedFiles = files.map((file: any) => {
            const isDirectory = file.IsDirectory;
            return {
                ...file,
                Path: isDirectory ? `/${apiPath}${file.ObjectName}/` : `/${apiPath}${file.ObjectName}`,
                FullPath: isDirectory ? `${apiPath}${file.ObjectName}/` : `${apiPath}${file.ObjectName}`,
                Name: file.ObjectName || '',
                Type: isDirectory ? 'directory' : 'file',
                Extension: isDirectory ? '' : (file.ObjectName?.split('.').pop() || ''),
            };
        });

        processedFiles.sort((a: any, b: any) => {
            if (a.IsDirectory && !b.IsDirectory) return -1;
            if (!a.IsDirectory && b.IsDirectory) return 1;
            return a.Name.localeCompare(b.Name);
        });

        return NextResponse.json(processedFiles);
    } catch (error: any) {
        console.error('Error listing files:', error);
        return NextResponse.json({ 
            error: 'Failed to list files',
            details: error.message 
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    if (!API_STORAGE_KEY || !STORAGE_ZONE_NAME) {
        return NextResponse.json({ error: 'CDN configuration missing' }, { status: 500 });
    }
    
    try {
        const { path } = await request.json();

        if (!path || typeof path !== 'string' || !path.endsWith('/')) {
            return NextResponse.json({ error: 'Valid directory path is required and must end with /' }, { status: 400 });
        }
        
        const cleanPath = path.replace(`/${STORAGE_ZONE_NAME}`, '').replace(/^\//, '');

        const createResponse = await fetch(
            `https://uk.storage.bunnycdn.com/${STORAGE_ZONE_NAME}/${cleanPath}`,
            {
                method: 'PUT',
                headers: {
                    'AccessKey': API_STORAGE_KEY!,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }
        );

        if (!createResponse.ok) {
             const errorText = await createResponse.text();
             console.error('Directory creation failed:', createResponse.status, errorText);
             throw new Error(`Directory creation failed: ${createResponse.status} - ${errorText}`);
        }

        return NextResponse.json({ success: true, message: 'Directory created successfully' });
    } catch (error: any) {
        console.error('Error creating directory:', error);
        return NextResponse.json({ error: 'Failed to create directory', details: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!API_STORAGE_KEY || !STORAGE_ZONE_NAME || !CDN_HOSTNAME) {
        return NextResponse.json({ error: 'CDN configuration missing' }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const path = formData.get('path') as string;

        if (!file || !path) {
            return NextResponse.json({ error: 'File and path are required' }, { status: 400 });
        }

        let cleanPath = path.replace(`/${STORAGE_ZONE_NAME}`, '').replace(/^\//, '');
        if (!cleanPath.endsWith('/') && cleanPath !== '') {
            cleanPath += '/';
        }

        const arrayBuffer = await file.arrayBuffer();

        const uploadResponse = await fetch(
            `https://uk.storage.bunnycdn.com/${STORAGE_ZONE_NAME}/${cleanPath}${file.name}`,
            {
                method: 'PUT',
                headers: {
                    'AccessKey': API_STORAGE_KEY!,
                    'Content-Type': 'application/octet-stream',
                },
                body: arrayBuffer,
            }
        );

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload failed:', uploadResponse.status, errorText);
            throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        const fileUrl = `https://${CDN_HOSTNAME}/${cleanPath}${file.name}`;

        return NextResponse.json({ 
            url: fileUrl,
            success: true,
            message: 'File uploaded successfully'
        });

    } catch (error: any) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ 
            error: 'Failed to upload file',
            details: error.message 
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!API_STORAGE_KEY || !STORAGE_ZONE_NAME) {
        return NextResponse.json({ error: 'CDN configuration missing' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const fullPath = searchParams.get('path');

        if (!fullPath) {
            return NextResponse.json({ error: 'Path is required' }, { status: 400 });
        }
        
        let cleanPath = fullPath.replace(`/${STORAGE_ZONE_NAME}`, '').replace(/^\//, '');

        const deleteResponse = await fetch(
            `https://uk.storage.bunnycdn.com/${STORAGE_ZONE_NAME}/${cleanPath}`,
            {
                method: 'DELETE',
                headers: {
                    'AccessKey': API_STORAGE_KEY!
                }
            }
        );

        if (!deleteResponse.ok) {
             const errorText = await deleteResponse.text();
             console.error('Deletion failed:', deleteResponse.status, errorText);
             throw new Error(`Deletion failed: ${deleteResponse.status} - ${errorText}`);
        }

        return NextResponse.json({ success: true, message: 'File or folder deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ error: 'Failed to delete file or folder', details: error.message }, { status: 500 });
    }
}
