export interface CreateFileResultDto {
    torrent: {
        '@type': string;
        hash: string;
        flags: number;
        total_size: string;
        description: string;
        files_count: string;
        included_size: string;
        dir_name: string;
        downloaded_size: string;
        added_at: number;
        root_dir: string;
        active_download: boolean;
        active_upload: boolean;
        completed: boolean;
        download_speed: number;
        upload_speed: number;
        fatal_error: string;
    };
    files: Array<{
        '@type': string;
        name: string;
        size: string;
        priority: number;
        downloaded_size: string;
    }>;
}
